import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./auth.routes";
import { geminiService, ProfileData } from "../services/gemini.service";
import { pdfService } from "../services/pdf.service";
import { docxService } from "../services/docx.service";
import { atsCheckerService } from "../services/atsChecker.service";

const prisma = new PrismaClient();

interface GenerateBody {
  jobDescription: string;
  targetRole?: string;
}

async function resumeRoutes(server: FastifyInstance) {
  // Generate resume with AI
  server.post<{ Body: GenerateBody }>(
    "/generate",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Body: GenerateBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const { jobDescription, targetRole } = request.body;

        if (!jobDescription) {
          return reply
            .status(400)
            .send({ error: "Job description is required" });
        }

        // Get user profile
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
          return reply
            .status(404)
            .send({ error: "Profile not found. Create a profile first." });
        }

        // Format profile data for Gemini
        const profileData: ProfileData = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone || undefined,
          location: profile.location || undefined,
          linkedin: profile.linkedin || undefined,
          github: profile.github || undefined,
          portfolio: profile.portfolio || undefined,
          summary: profile.summary || undefined,
          experiences: profile.experiences.map((exp) => ({
            company: exp.company,
            role: exp.role,
            location: exp.location || undefined,
            startDate: exp.startDate,
            endDate: exp.endDate || undefined,
            current: exp.current,
            bullets: JSON.parse(exp.bullets || "[]"),
          })),
          education: profile.education.map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            location: edu.location || undefined,
            startDate: edu.startDate || undefined,
            endDate: edu.endDate || undefined,
            gpa: edu.gpa || undefined,
          })),
          skills: profile.skills.map((skill) => ({
            name: skill.name,
            category: skill.category,
          })),
          projects: profile.projects.map((p) => ({
            name: p.name,
            description: p.description,
            technologies: p.technologies || undefined,
            link: p.link || undefined,
          })),
          certifications: profile.certifications.map((c) => ({
            name: c.name,
            issuer: c.issuer,
            date: c.date || undefined,
          })),
        };

        // Generate optimized resume using Gemini AI
        const generatedResume = await geminiService.generateOptimizedResume(
          profileData,
          jobDescription,
        );

        // Save generated resume
        const resume = await prisma.resume.create({
          data: {
            userId,
            name: targetRole || generatedResume.contactInfo.name + " Resume",
            jobDescription,
            targetRole,
            generatedContent: JSON.stringify(generatedResume),
            atsScore: generatedResume.atsScore,
          },
        });

        // Run ATS compatibility check
        const atsReport = atsCheckerService.checkResume(
          generatedResume,
          jobDescription,
        );

        return reply.send({
          message: "Resume generated successfully",
          resume: {
            id: resume.id,
            name: resume.name,
            atsScore: generatedResume.atsScore,
            keywords: generatedResume.keywords,
          },
          content: generatedResume,
          atsReport,
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to generate resume" });
      }
    },
  );

  // Get all resumes
  server.get(
    "/",
    { preHandler: authenticateToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = (request as any).user;

        const resumes = await prisma.resume.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            targetRole: true,
            atsScore: true,
            createdAt: true,
          },
        });

        return reply.send({ resumes });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to get resumes" });
      }
    },
  );

  // Get specific resume
  server.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;

        const resume = await prisma.resume.findUnique({ where: { id } });

        if (!resume) {
          return reply.status(404).send({ error: "Resume not found" });
        }

        return reply.send({
          resume: {
            ...resume,
            content: JSON.parse(resume.generatedContent),
          },
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to get resume" });
      }
    },
  );

  // Delete resume
  server.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        await prisma.resume.delete({ where: { id } });
        return reply.send({ message: "Resume deleted" });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to delete resume" });
      }
    },
  );

  // Export resume as PDF
  server.get<{ Params: { id: string }; Querystring: { template?: string } }>(
    "/:id/export/pdf",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Querystring: { template?: string };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        const { template } = request.query;

        const resume = await prisma.resume.findUnique({ where: { id } });

        if (!resume) {
          return reply.status(404).send({ error: "Resume not found" });
        }

        const content = JSON.parse(resume.generatedContent);
        // Cast template string to TemplateType, defaulting to 'modern' if invalid or missing
        const selectedTemplate = (
          ["modern", "executive", "minimalist"].includes(template || "")
            ? template
            : "modern"
        ) as any;

        const pdfBuffer = await pdfService.generateResumePDF(
          content,
          selectedTemplate,
        );

        const filename = `${content.contactInfo.name.replace(/\s+/g, "_")}_${selectedTemplate}_Resume.pdf`;

        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        return reply.send(pdfBuffer);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to export PDF" });
      }
    },
  );

  // Export resume as DOCX
  server.get<{ Params: { id: string } }>(
    "/:id/export/docx",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;

        const resume = await prisma.resume.findUnique({ where: { id } });

        if (!resume) {
          return reply.status(404).send({ error: "Resume not found" });
        }

        const content = JSON.parse(resume.generatedContent);
        const docxBuffer = await docxService.generateResumeDocx(content);

        const filename = `${content.contactInfo.name.replace(/\s+/g, "_")}_Resume.docx`;

        reply.header(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        reply.header(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        return reply.send(docxBuffer);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to export DOCX" });
      }
    },
  );

  // Preview resume (returns JSON for frontend rendering)
  server.get<{ Params: { id: string } }>(
    "/:id/preview",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;

        const resume = await prisma.resume.findUnique({ where: { id } });

        if (!resume) {
          return reply.status(404).send({ error: "Resume not found" });
        }

        return reply.send({
          content: JSON.parse(resume.generatedContent),
          atsScore: resume.atsScore,
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to preview resume" });
      }
    },
  );

  // Regenerate resume with modifications
  server.post<{ Params: { id: string }; Body: { jobDescription?: string } }>(
    "/:id/regenerate",
    { preHandler: authenticateToken },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { jobDescription?: string };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = (request as any).user;
        const { id } = request.params;
        const { jobDescription } = request.body;

        const existingResume = await prisma.resume.findUnique({
          where: { id },
        });

        if (!existingResume) {
          return reply.status(404).send({ error: "Resume not found" });
        }

        const jd = jobDescription || existingResume.jobDescription;

        if (!jd) {
          return reply
            .status(400)
            .send({ error: "Job description is required" });
        }

        // Get user profile
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
          return reply.status(404).send({ error: "Profile not found" });
        }

        const profileData: ProfileData = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone || undefined,
          location: profile.location || undefined,
          linkedin: profile.linkedin || undefined,
          github: profile.github || undefined,
          summary: profile.summary || undefined,
          experiences: profile.experiences.map((exp) => ({
            company: exp.company,
            role: exp.role,
            location: exp.location || undefined,
            startDate: exp.startDate,
            endDate: exp.endDate || undefined,
            current: exp.current,
            bullets: JSON.parse(exp.bullets || "[]"),
          })),
          education: profile.education.map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            location: edu.location || undefined,
            endDate: edu.endDate || undefined,
            gpa: edu.gpa || undefined,
          })),
          skills: profile.skills.map((skill) => ({
            name: skill.name,
            category: skill.category,
          })),
          projects: profile.projects.map((p) => ({
            name: p.name,
            description: p.description,
            technologies: p.technologies || undefined,
            link: p.link || undefined,
          })),
          certifications: profile.certifications.map((c) => ({
            name: c.name,
            issuer: c.issuer,
            date: c.date || undefined,
          })),
        };

        const generatedResume = await geminiService.generateOptimizedResume(
          profileData,
          jd,
        );

        // Update resume
        await prisma.resume.update({
          where: { id },
          data: {
            jobDescription: jd,
            generatedContent: JSON.stringify(generatedResume),
            atsScore: generatedResume.atsScore,
          },
        });

        // Run ATS compatibility check
        const atsReport = atsCheckerService.checkResume(generatedResume, jd);

        return reply.send({
          message: "Resume regenerated successfully",
          content: generatedResume,
          atsReport,
        });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to regenerate resume" });
      }
    },
  );
}

export default resumeRoutes;
