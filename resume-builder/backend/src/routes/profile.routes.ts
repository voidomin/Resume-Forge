import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authenticateToken } from "./auth.routes";
import { resumeParserService } from "../services/resumeParser.service";
import { prisma } from "../lib/prisma";
import { LRUCache } from "lru-cache";

const profileCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Loads the caller's profile and verifies the given sub-resource
// (experience/education/skill/coursework/leadership/award) belongs to it,
// sending a 404 (never confirming the id exists to a non-owner) and
// returning null if either check fails. Used by every sub-resource
// update/delete route to prevent one user from mutating another user's
// data by guessing an id.
async function requireOwnedRecord(
  request: FastifyRequest,
  reply: FastifyReply,
  model: {
    findUnique: (args: {
      where: { id: string };
    }) => Promise<{ profileId: string } | null>;
  },
  id: string,
  notFoundMessage: string,
): Promise<boolean> {
  const { userId } = (request as any).user;
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const record = profile ? await model.findUnique({ where: { id } }) : null;

  if (!profile || !record || record.profileId !== profile.id) {
    reply.status(404).send({ error: notFoundMessage });
    return false;
  }
  return true;
}

type OwnedModel = {
  findUnique: (args: {
    where: { id: string };
  }) => Promise<{ profileId: string } | null>;
};

// Registers `DELETE <path>` for a profile sub-resource: verifies ownership,
// deletes, and replies - shared across every sub-resource type so the
// (ownership check + delete + response) shape isn't duplicated per model.
function registerDeleteSubResourceRoute(
  server: FastifyInstance,
  path: string,
  model: OwnedModel & {
    delete: (args: { where: { id: string } }) => Promise<unknown>;
  },
  resourceName: string,
) {
  const lowerName =
    resourceName.charAt(0).toLowerCase() + resourceName.slice(1);
  server.delete<{ Params: { id: string } }>(
    path,
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        if (
          !(await requireOwnedRecord(
            request,
            reply,
            model,
            id,
            `${resourceName} not found`,
          ))
        ) {
          return;
        }

        await model.delete({ where: { id } });
        return reply.send({ message: `${resourceName} deleted` });
      } catch (error) {
        request.log.error(error);
        return reply
          .status(500)
          .send({ error: `Failed to delete ${lowerName}` });
      }
    },
  );
}

// Registers `PUT <path>` for a profile sub-resource: verifies ownership,
// applies `buildData(body)` as the Prisma update payload, and replies under
// `responseKey` - shared across every sub-resource type for the same reason
// as registerDeleteSubResourceRoute above.
function registerUpdateSubResourceRoute<TBody>(
  server: FastifyInstance,
  path: string,
  model: OwnedModel & {
    update: (args: { where: { id: string }; data: unknown }) => Promise<any>;
  },
  resourceName: string,
  responseKey: string,
  buildData: (body: TBody) => Record<string, unknown>,
) {
  const lowerName =
    resourceName.charAt(0).toLowerCase() + resourceName.slice(1);
  server.put<{ Body: TBody; Params: { id: string } }>(
    path,
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: TBody; Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        if (
          !(await requireOwnedRecord(
            request,
            reply,
            model,
            id,
            `${resourceName} not found`,
          ))
        ) {
          return;
        }

        const updated = await model.update({
          where: { id },
          data: buildData(request.body as TBody),
        });
        return reply.send({
          [responseKey]: updated,
          message: `${resourceName} updated`,
        });
      } catch (error) {
        request.log.error(error);
        return reply
          .status(500)
          .send({ error: `Failed to update ${lowerName}` });
      }
    },
  );
}

interface ProfileBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
}

interface ExperienceBody {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bullets: string[];
}

interface EducationBody {
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

interface SkillBody {
  name: string;
  category: string;
  proficiency?: string;
}

async function profileRoutes(server: FastifyInstance) {
  // Get user profile
  server.get(
    "/",
    { preHandler: authenticateToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = (request as any).user;

        // Check cache first
        const cachedProfile = profileCache.get(userId);
        if (cachedProfile) {
          return reply.send({ profile: cachedProfile });
        }

        const profile = await prisma.profile.findUnique({
          where: { userId },
          include: {
            education: { orderBy: { endDate: "desc" } },
            experiences: { orderBy: { startDate: "desc" } },
            skills: true,
            projects: true,
            certifications: true,
          },
        });

        if (!profile) {
          return reply.send({
            profile: null,
            message: "No profile found. Create one to get started.",
          });
        }

        // Parse JSON fields
        const formattedProfile = {
          ...profile,
          experiences: profile.experiences.map((exp) => ({
            ...exp,
            bullets: JSON.parse(exp.bullets || "[]"),
            keywords: exp.keywords ? JSON.parse(exp.keywords) : [],
          })),
          education: profile.education.map((edu) => ({
            ...edu,
            achievements: edu.achievements ? JSON.parse(edu.achievements) : [],
          })),
        };

        // Cache the result
        profileCache.set(userId, formattedProfile);

        return reply.send({ profile: formattedProfile });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to get profile" });
      }
    },
  );

  // Create or update profile
  server.post<{ Body: ProfileBody }>(
    "/",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: ProfileBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const profileData = request.body;

        const profile = await prisma.profile.upsert({
          where: { userId },
          update: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
            location: profileData.location,
            linkedin: profileData.linkedin,
            github: profileData.github,
            portfolio: profileData.portfolio,
            summary: profileData.summary,
          },
          create: {
            userId,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
            location: profileData.location,
            linkedin: profileData.linkedin,
            github: profileData.github,
            portfolio: profileData.portfolio,
            summary: profileData.summary,
          },
        });

        // Invalidate cache
        profileCache.delete(userId);

        return reply.send({ profile, message: "Profile saved successfully" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to save profile" });
      }
    },
  );

  // Import profile from JSON
  server.post(
    "/import",
    { preHandler: authenticateToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = (request as any).user;
        const data = request.body as any;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          return reply.status(401).send({
            error: "Invalid or expired session. Please log in again.",
          });
        }

        // Create or update profile
        const profile = await handleProfileUpsert(userId, data);

        // Delete existing data
        await clearAllProfileData(profile.id);

        // Add sub-entities
        await importExperiences(profile.id, data.experiences);
        await importEducation(profile.id, data.education);
        await importSkills(profile.id, data.skills);
        await importProjects(profile.id, data.projects);
        await importCertifications(profile.id, data.certifications);

        return reply.send({
          success: true,
          message: "Profile imported successfully",
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to import profile" });
      }
    },
  );

  // Export profile as JSON
  server.get(
    "/export",
    { preHandler: authenticateToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = (request as any).user;

        const profile = await prisma.profile.findUnique({
          where: { userId },
          include: {
            experiences: { orderBy: { startDate: "desc" } },
            education: { orderBy: { endDate: "desc" } },
            skills: true,
            projects: true,
            certifications: true,
          },
        });

        if (!profile) {
          return reply.status(404).send({ error: "No profile found" });
        }

        const exportData = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          linkedin: profile.linkedin,
          github: profile.github,
          portfolio: profile.portfolio,
          summary: profile.summary,
          experiences: profile.experiences.map((exp) => ({
            company: exp.company,
            role: exp.role,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            current: exp.current,
            bullets: JSON.parse(exp.bullets || "[]"),
          })),
          education: profile.education.map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            location: edu.location,
            startDate: edu.startDate,
            endDate: edu.endDate,
            gpa: edu.gpa,
          })),
          skills: profile.skills.map((skill) => ({
            name: skill.name,
            category: skill.category,
            proficiency: skill.proficiency,
          })),
          projects: profile.projects.map((p) => ({
            name: p.name,
            description: p.description,
            technologies: p.technologies,
            link: p.link,
          })),
          certifications: profile.certifications.map((c) => ({
            name: c.name,
            issuer: c.issuer,
            date: c.date,
            link: c.link,
          })),
        };

        reply.header(
          "Content-Disposition",
          "attachment; filename=profile.json",
        );
        return reply.send(exportData);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to export profile" });
      }
    },
  );

  // Add experience
  server.post<{ Body: ExperienceBody }>(
    "/experiences",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: ExperienceBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const expData = request.body;

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
          return reply
            .status(404)
            .send({ error: "Profile not found. Create a profile first." });
        }

        const experience = await prisma.experience.create({
          data: {
            profileId: profile.id,
            company: expData.company,
            role: expData.role,
            location: expData.location,
            startDate: expData.startDate,
            endDate: expData.endDate,
            current: expData.current,
            bullets: JSON.stringify(expData.bullets || []),
          },
        });

        return reply
          .status(201)
          .send({ experience, message: "Experience added" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to add experience" });
      }
    },
  );

  // Update experience
  registerUpdateSubResourceRoute<ExperienceBody>(
    server,
    "/experiences/:id",
    prisma.experience,
    "Experience",
    "experience",
    (body) => ({
      company: body.company,
      role: body.role,
      location: body.location,
      startDate: body.startDate,
      endDate: body.endDate,
      current: body.current,
      bullets: JSON.stringify(body.bullets || []),
    }),
  );

  // Delete experience
  registerDeleteSubResourceRoute(
    server,
    "/experiences/:id",
    prisma.experience,
    "Experience",
  );

  // Add education
  server.post<{ Body: EducationBody }>(
    "/education",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: EducationBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const eduData = request.body;

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
          return reply
            .status(404)
            .send({ error: "Profile not found. Create a profile first." });
        }

        const education = await prisma.education.create({
          data: {
            profileId: profile.id,
            institution: eduData.institution,
            degree: eduData.degree,
            field: eduData.field,
            location: eduData.location,
            startDate: eduData.startDate,
            endDate: eduData.endDate,
            gpa: eduData.gpa,
          },
        });

        return reply
          .status(201)
          .send({ education, message: "Education added" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to add education" });
      }
    },
  );

  // Delete education
  registerDeleteSubResourceRoute(
    server,
    "/education/:id",
    prisma.education,
    "Education",
  );

  // Add skill
  server.post<{ Body: SkillBody }>(
    "/skills",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: SkillBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const skillData = request.body;

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
          return reply
            .status(404)
            .send({ error: "Profile not found. Create a profile first." });
        }

        const skill = await prisma.skill.create({
          data: {
            profileId: profile.id,
            name: skillData.name,
            category: skillData.category,
            proficiency: skillData.proficiency,
          },
        });

        return reply.status(201).send({ skill, message: "Skill added" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to add skill" });
      }
    },
  );

  // Delete skill
  registerDeleteSubResourceRoute(server, "/skills/:id", prisma.skill, "Skill");

  // Bulk add skills
  server.post<{ Body: { skills: SkillBody[] } }>(
    "/skills/bulk",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: { skills: SkillBody[] } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const { skills } = request.body;

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
          return reply.status(404).send({ error: "Profile not found" });
        }

        // Delete existing skills and add new ones
        await prisma.skill.deleteMany({ where: { profileId: profile.id } });

        for (const skill of skills) {
          await prisma.skill.create({
            data: {
              profileId: profile.id,
              name: skill.name,
              category: skill.category || "technical",
              proficiency: skill.proficiency,
            },
          });
        }

        return reply.send({ message: "Skills updated", count: skills.length });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to update skills" });
      }
    },
  );

  // Upload resume (PDF/DOCX) and auto-fill profile
  server.post(
    "/upload-resume",
    { preHandler: authenticateToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = (request as any).user;
        console.log("Resume upload started for user:", userId);

        // Get the file from multipart request
        const data = await request.file();
        console.log("File received:", data ? "yes" : "no");

        if (!data) {
          console.log("No file in request");
          return reply.status(400).send({ error: "No file uploaded" });
        }

        console.log("File info:", {
          filename: data.filename,
          mimetype: data.mimetype,
          fieldname: data.fieldname,
        });

        // Check file type
        const allowedTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ];

        if (!allowedTypes.includes(data.mimetype)) {
          console.log("Invalid file type:", data.mimetype);
          return reply
            .status(400)
            .send({ error: "Please upload a PDF or DOCX file" });
        }

        // Read file buffer using toBuffer method
        let buffer: Buffer;
        try {
          buffer = await data.toBuffer();
          console.log("Buffer size:", buffer.length);
        } catch (bufferError) {
          console.error("Error reading file buffer:", bufferError);
          // Fallback to chunks method
          const chunks: Buffer[] = [];
          for await (const chunk of data.file) {
            chunks.push(chunk);
          }
          buffer = Buffer.concat(chunks);
          request.log.debug(`Buffer size (fallback): ${buffer.length}`);
        }

        // Check file size (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          return reply
            .status(400)
            .send({ error: "File size must be less than 5MB" });
        }

        if (buffer.length === 0) {
          return reply.status(400).send({ error: "Empty file uploaded" });
        }

        request.log.debug("Starting resume parsing...");
        // Parse resume and extract profile data
        const parsedProfile = await resumeParserService.parseResume(
          buffer,
          data.mimetype,
        );
        request.log.debug("Resume parsed successfully");

        return reply.send({
          message: "Resume parsed successfully",
          profile: parsedProfile,
        });
      } catch (error: any) {
        console.error("Resume upload error:", error);
        request.log.error(error);
        return reply
          .status(500)
          .send({ error: error.message || "Failed to parse resume" });
      }
    },
  );

  // Import profile from parsed resume data
  server.post(
    "/import-from-resume",
    { preHandler: authenticateToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = (request as any).user;
        const data = request.body as any;

        // Create or update profile
        const profile = await handleProfileUpsert(userId, data, true);

        // Delete existing data
        await clearAllProfileData(profile.id);

        // Add sub-entities with slightly different mapping for resume parser
        await importExperiences(profile.id, data.experiences, true);
        await importEducation(profile.id, data.education, true);
        await importSkills(profile.id, data.skills);
        await importProjects(profile.id, data.projects);
        await importCertifications(profile.id, data.certifications);
        await importCoursework(profile.id, data.coursework);
        await importLeadership(profile.id, data.leadership);
        await importAwards(profile.id, data.awards);

        return reply.send({
          success: true,
          message: "Profile imported successfully",
        });
      } catch (error: any) {
        if (error?.code === "P2003") {
          return reply.status(401).send({
            error: "Invalid or expired session. Please log in again.",
          });
        }
        console.error("Profile import error:", error);
        request.log.error(error);
        return reply.status(500).send({
          error: "Failed to import profile",
          message: error.message,
          type: error.constructor.name,
        });
      }
    },
  );

  // ==================== COURSEWORK ROUTES ====================

  interface CourseworkBody {
    courseName: string;
    topic: string;
    institution?: string;
  }

  // Add coursework
  server.post<{ Body: CourseworkBody }>(
    "/coursework",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: CourseworkBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const data = request.body;

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
          return reply
            .status(404)
            .send({ error: "Profile not found. Create a profile first." });
        }

        const coursework = await prisma.coursework.create({
          data: {
            profileId: profile.id,
            courseName: data.courseName,
            topic: data.topic,
            institution: data.institution,
          },
        });

        return reply
          .status(201)
          .send({ coursework, message: "Coursework added" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to add coursework" });
      }
    },
  );

  // Update coursework
  registerUpdateSubResourceRoute<CourseworkBody>(
    server,
    "/coursework/:id",
    prisma.coursework,
    "Coursework",
    "coursework",
    (body) => ({
      courseName: body.courseName,
      topic: body.topic,
      institution: body.institution,
    }),
  );

  // Delete coursework
  registerDeleteSubResourceRoute(
    server,
    "/coursework/:id",
    prisma.coursework,
    "Coursework",
  );

  // ==================== LEADERSHIP ROUTES ====================

  interface LeadershipBody {
    title: string;
    organization: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }

  // Add leadership
  server.post<{ Body: LeadershipBody }>(
    "/leadership",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: LeadershipBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const data = request.body;

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
          return reply
            .status(404)
            .send({ error: "Profile not found. Create a profile first." });
        }

        const leadership = await prisma.leadership.create({
          data: {
            profileId: profile.id,
            title: data.title,
            organization: data.organization,
            location: data.location,
            startDate: data.startDate,
            endDate: data.endDate,
            current: data.current,
            description: data.description,
          },
        });

        return reply
          .status(201)
          .send({ leadership, message: "Leadership role added" });
      } catch (error) {
        request.log.error(error);
        return reply
          .status(500)
          .send({ error: "Failed to add leadership role" });
      }
    },
  );

  // Update leadership
  registerUpdateSubResourceRoute<LeadershipBody>(
    server,
    "/leadership/:id",
    prisma.leadership,
    "Leadership role",
    "leadership",
    (body) => ({
      title: body.title,
      organization: body.organization,
      location: body.location,
      startDate: body.startDate,
      endDate: body.endDate,
      current: body.current,
      description: body.description,
    }),
  );

  // Delete leadership
  registerDeleteSubResourceRoute(
    server,
    "/leadership/:id",
    prisma.leadership,
    "Leadership role",
  );

  // ==================== AWARDS ROUTES ====================

  interface AwardBody {
    awardName: string;
    organization: string;
    awardDate: string;
    description?: string;
  }

  // Add award
  server.post<{ Body: AwardBody }>(
    "/awards",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: AwardBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const data = request.body;

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
          return reply
            .status(404)
            .send({ error: "Profile not found. Create a profile first." });
        }

        const award = await prisma.award.create({
          data: {
            profileId: profile.id,
            awardName: data.awardName,
            organization: data.organization,
            awardDate: data.awardDate,
            description: data.description,
          },
        });

        return reply.status(201).send({ award, message: "Award added" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to add award" });
      }
    },
  );

  // Update award
  registerUpdateSubResourceRoute<AwardBody>(
    server,
    "/awards/:id",
    prisma.award,
    "Award",
    "award",
    (body) => ({
      awardName: body.awardName,
      organization: body.organization,
      awardDate: body.awardDate,
      description: body.description,
    }),
  );

  // Delete award
  registerDeleteSubResourceRoute(server, "/awards/:id", prisma.award, "Award");
}

/**
 * HELPER FUNCTIONS FOR PROFILE IMPORT
 */

async function handleProfileUpsert(
  userId: string,
  data: any,
  usePlaceholders = false,
) {
  const defaultVal = usePlaceholders ? "-" : undefined;
  return await prisma.profile.upsert({
    where: { userId },
    update: {
      firstName: data.firstName || (usePlaceholders ? "-" : data.firstName),
      lastName: data.lastName || (usePlaceholders ? "-" : data.lastName),
      email: data.email || (usePlaceholders ? "-" : data.email),
      phone: data.phone,
      location: data.location,
      linkedin: data.linkedin,
      github: data.github,
      portfolio: data.portfolio,
      summary: data.summary,
    },
    create: {
      userId,
      firstName: data.firstName || defaultVal || "-",
      lastName: data.lastName || defaultVal || "-",
      email: data.email || defaultVal || "-",
      phone: data.phone,
      location: data.location,
      linkedin: data.linkedin,
      github: data.github,
      portfolio: data.portfolio,
      summary: data.summary,
    },
  });
}

async function clearAllProfileData(profileId: string) {
  console.log(`Clearing existing profile data for id: ${profileId}`);
  const where = { profileId };
  await Promise.all([
    prisma.experience.deleteMany({ where }),
    prisma.education.deleteMany({ where }),
    prisma.skill.deleteMany({ where }),
    prisma.project.deleteMany({ where }),
    prisma.certification.deleteMany({ where }),
    prisma.coursework.deleteMany({ where }),
    prisma.leadership.deleteMany({ where }),
    prisma.award.deleteMany({ where }),
  ]);
}

async function importExperiences(
  profileId: string,
  experiences: any[],
  usePlaceholders = false,
) {
  if (!experiences || !Array.isArray(experiences)) return;
  for (const exp of experiences) {
    await prisma.experience.create({
      data: {
        profileId,
        company: exp.company || (usePlaceholders ? "Unknown Company" : "-"),
        role: exp.role || (usePlaceholders ? "Professional" : "-"),
        location: exp.location,
        startDate: exp.startDate || (usePlaceholders ? "N/A" : "-"),
        endDate: exp.endDate,
        current: exp.current || false,
        bullets: JSON.stringify(exp.bullets || []),
        keywords: exp.keywords ? JSON.stringify(exp.keywords) : null,
      },
    });
  }
}

async function importEducation(
  profileId: string,
  education: any[],
  usePlaceholders = false,
) {
  if (!education || !Array.isArray(education)) return;
  for (const edu of education) {
    await prisma.education.create({
      data: {
        profileId,
        institution:
          edu.institution || (usePlaceholders ? "Unknown Institution" : "-"),
        degree: edu.degree || (usePlaceholders ? "Degree" : "-"),
        field: edu.field || (usePlaceholders ? "General" : "-"),
        location: edu.location,
        startDate: edu.startDate,
        endDate: edu.endDate,
        gpa: edu.gpa,
        achievements: edu.achievements
          ? JSON.stringify(edu.achievements)
          : null,
      },
    });
  }
}

async function importSkills(profileId: string, skills: any[]) {
  if (!skills || !Array.isArray(skills)) return;
  for (const skill of skills) {
    await prisma.skill.create({
      data: {
        profileId,
        name: skill.name,
        category: skill.category || "technical",
        proficiency: skill.proficiency,
      },
    });
  }
}

async function importProjects(profileId: string, projects: any[]) {
  if (!projects || !Array.isArray(projects)) return;
  for (const proj of projects) {
    await prisma.project.create({
      data: {
        profileId,
        name: proj.name,
        description: proj.description || "-",
        technologies: proj.technologies,
        link: proj.link,
      },
    });
  }
}

async function importCertifications(profileId: string, certifications: any[]) {
  if (!certifications || !Array.isArray(certifications)) return;
  for (const cert of certifications) {
    await prisma.certification.create({
      data: {
        profileId,
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
        link: cert.link,
      },
    });
  }
}

async function importLeadership(profileId: string, leadership: any[]) {
  if (!leadership || !Array.isArray(leadership)) return;
  for (const lead of leadership) {
    await prisma.leadership.create({
      data: {
        profileId,
        title: lead.title || lead.role || "Volunteer",
        organization: lead.organization || "-",
        location: lead.location,
        startDate: lead.startDate,
        endDate: lead.endDate,
        current: lead.current || false,
        description: lead.description,
      },
    });
  }
}

async function importAwards(profileId: string, awards: any[]) {
  if (!awards || !Array.isArray(awards)) return;
  for (const award of awards) {
    await prisma.award.create({
      data: {
        profileId,
        awardName: award.awardName || "Award",
        organization: award.organization || "N/A",
        awardDate: award.awardDate || "N/A",
        description: award.description,
      },
    });
  }
}

async function importCoursework(profileId: string, coursework: any[]) {
  if (!coursework || !Array.isArray(coursework)) return;
  for (const course of coursework) {
    await prisma.coursework.create({
      data: {
        profileId,
        courseName: course.courseName,
        topic: course.topic || "-",
        institution: course.institution,
      },
    });
  }
}

export default profileRoutes;
