import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authenticateToken } from "./auth.routes";
import { resumeParserService } from "../services/resumeParser.service";
import { prisma } from "../lib/prisma";

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
        const profile = await prisma.profile.upsert({
          where: { userId },
          update: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            linkedin: data.linkedin,
            github: data.github,
            portfolio: data.portfolio,
            summary: data.summary,
          },
          create: {
            userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            linkedin: data.linkedin,
            github: data.github,
            portfolio: data.portfolio,
            summary: data.summary,
          },
        });

        console.log(`Clearing existing profile data for id: ${profile.id}`);
        // Delete existing experiences, education, skills, projects, certifications
        await prisma.experience.deleteMany({
          where: { profileId: profile.id },
        });
        await prisma.education.deleteMany({ where: { profileId: profile.id } });
        await prisma.skill.deleteMany({ where: { profileId: profile.id } });
        await prisma.project.deleteMany({ where: { profileId: profile.id } });
        await prisma.certification.deleteMany({
          where: { profileId: profile.id },
        });

        console.log(
          `Importing ${data.experiences?.length || 0} experiences...`,
        );
        // Add experiences
        if (data.experiences && Array.isArray(data.experiences)) {
          for (const exp of data.experiences) {
            await prisma.experience.create({
              data: {
                profileId: profile.id,
                company: exp.company,
                role: exp.role,
                location: exp.location,
                startDate: exp.startDate,
                endDate: exp.endDate,
                current: exp.current || false,
                bullets: JSON.stringify(exp.bullets || []),
                keywords: exp.keywords ? JSON.stringify(exp.keywords) : null,
              },
            });
          }
        }

        console.log(
          `Importing ${data.education?.length || 0} education entries...`,
        );
        // Add education
        if (data.education && Array.isArray(data.education)) {
          for (const edu of data.education) {
            await prisma.education.create({
              data: {
                profileId: profile.id,
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field,
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

        console.log("Importing skills, projects, and certifications...");
        // Add skills
        if (data.skills && Array.isArray(data.skills)) {
          for (const skill of data.skills) {
            await prisma.skill.create({
              data: {
                profileId: profile.id,
                name: skill.name,
                category: skill.category || "technical",
                proficiency: skill.proficiency,
              },
            });
          }
        }

        // Add projects
        if (data.projects && Array.isArray(data.projects)) {
          for (const proj of data.projects) {
            await prisma.project.create({
              data: {
                profileId: profile.id,
                name: proj.name,
                description: proj.description,
                technologies: proj.technologies,
                link: proj.link,
              },
            });
          }
        }

        // Add certifications
        if (data.certifications && Array.isArray(data.certifications)) {
          for (const cert of data.certifications) {
            await prisma.certification.create({
              data: {
                profileId: profile.id,
                name: cert.name,
                issuer: cert.issuer,
                date: cert.date,
                link: cert.link,
              },
            });
          }
        }

        console.log("Profile import complete.");
        return reply.send({
          message: "Profile imported successfully",
          profileId: profile.id,
        });
      } catch (error) {
        console.error("Profile import error:", error);
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
  server.put<{ Body: ExperienceBody; Params: { id: string } }>(
    "/experiences/:id",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: ExperienceBody; Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        const expData = request.body;

        const experience = await prisma.experience.update({
          where: { id },
          data: {
            company: expData.company,
            role: expData.role,
            location: expData.location,
            startDate: expData.startDate,
            endDate: expData.endDate,
            current: expData.current,
            bullets: JSON.stringify(expData.bullets || []),
          },
        });

        return reply.send({ experience, message: "Experience updated" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to update experience" });
      }
    },
  );

  // Delete experience
  server.delete<{ Params: { id: string } }>(
    "/experiences/:id",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        await prisma.experience.delete({ where: { id } });
        return reply.send({ message: "Experience deleted" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to delete experience" });
      }
    },
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
  server.delete<{ Params: { id: string } }>(
    "/education/:id",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        await prisma.education.delete({ where: { id } });
        return reply.send({ message: "Education deleted" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to delete education" });
      }
    },
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
  server.delete<{ Params: { id: string } }>(
    "/skills/:id",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        await prisma.skill.delete({ where: { id } });
        return reply.send({ message: "Skill deleted" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to delete skill" });
      }
    },
  );

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
        const profile = await prisma.profile.upsert({
          where: { userId },
          update: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            linkedin: data.linkedin,
            github: data.github,
            portfolio: data.portfolio,
            summary: data.summary,
          },
          create: {
            userId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            linkedin: data.linkedin,
            github: data.github,
            portfolio: data.portfolio,
            summary: data.summary,
          },
        });

        // Delete existing data and add new
        // Delete existing data and add new
        await prisma.experience.deleteMany({
          where: { profileId: profile.id },
        });
        await prisma.education.deleteMany({ where: { profileId: profile.id } });
        await prisma.skill.deleteMany({ where: { profileId: profile.id } });
        await prisma.project.deleteMany({ where: { profileId: profile.id } });
        await prisma.certification.deleteMany({
          where: { profileId: profile.id },
        });

        // Add experiences
        if (data.experiences && Array.isArray(data.experiences)) {
          for (const exp of data.experiences) {
            await prisma.experience.create({
              data: {
                profileId: profile.id,
                company: exp.company,
                role: exp.role,
                location: exp.location,
                startDate: exp.startDate,
                endDate: exp.endDate,
                current: exp.current || false,
                bullets: JSON.stringify(exp.bullets || []),
              },
            });
          }
        }

        // Add education
        if (data.education && Array.isArray(data.education)) {
          for (const edu of data.education) {
            await prisma.education.create({
              data: {
                profileId: profile.id,
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field,
                location: edu.location,
                startDate: edu.startDate,
                endDate: edu.endDate,
                gpa: edu.gpa,
              },
            });
          }
        }

        // Add skills
        if (data.skills && Array.isArray(data.skills)) {
          for (const skill of data.skills) {
            await prisma.skill.create({
              data: {
                profileId: profile.id,
                name: skill.name,
                category: skill.category || "technical",
              },
            });
          }
        }

        // Add projects
        if (data.projects && Array.isArray(data.projects)) {
          for (const proj of data.projects) {
            await prisma.project.create({
              data: {
                profileId: profile.id,
                name: proj.name,
                description: proj.description,
                technologies: proj.technologies,
                link: proj.link,
              },
            });
          }
        }

        // Add certifications
        if (data.certifications && Array.isArray(data.certifications)) {
          for (const cert of data.certifications) {
            await prisma.certification.create({
              data: {
                profileId: profile.id,
                name: cert.name,
                issuer: cert.issuer,
                date: cert.date,
                link: cert.link,
              },
            });
          }
        }

        return reply.send({
          message: "Profile imported from resume successfully",
          profileId: profile.id,
        });
      } catch (error: any) {
        if (error?.code === "P2003") {
          return reply.status(401).send({
            error: "Invalid or expired session. Please log in again.",
          });
        }
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to import profile" });
      }
    },
  );
}

export default profileRoutes;
