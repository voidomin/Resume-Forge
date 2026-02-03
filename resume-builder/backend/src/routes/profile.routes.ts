import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./auth.routes";

const prisma = new PrismaClient();

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
            experiences: { orderBy: { startDate: "desc" } },
            education: { orderBy: { endDate: "desc" } },
            skills: true,
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

        // Delete existing experiences, education, skills
        await prisma.experience.deleteMany({
          where: { profileId: profile.id },
        });
        await prisma.education.deleteMany({ where: { profileId: profile.id } });
        await prisma.skill.deleteMany({ where: { profileId: profile.id } });

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

        return reply.send({
          message: "Profile imported successfully",
          profileId: profile.id,
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
}

export default profileRoutes;
