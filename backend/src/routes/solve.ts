import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { gateway } from "@specific-dev/framework";
import { generateText } from "ai";
import type { App } from "../index.js";

interface SolveProblemBody {
  problem: string;
  category: string;
}

interface SolveImageBody {
  problem: string;
}

export function registerSolveRoutes(app: App, fastify: FastifyInstance) {
  fastify.post<{ Body: SolveProblemBody }>(
    "/api/solve",
    {
      schema: {
        description: "Generate a step-by-step solution for a problem using AI",
        tags: ["solve"],
        body: {
          type: "object",
          properties: {
            problem: { type: "string", description: "The problem description" },
            category: { type: "string", description: "Problem category (cleaning, tech, finance, life-hack, text-simplification)" },
          },
          required: ["problem", "category"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              solution: { type: "string" },
              category: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: SolveProblemBody }>, reply: FastifyReply) => {
      const { problem, category } = request.body;

      app.logger.info(
        { problem, category },
        "Solving problem using AI"
      );

      try {
        const { text } = await generateText({
          model: gateway("google/gemini-2.5-flash"),
          system: `You are a helpful life hack expert. Provide fast, actionable, step-by-step solutions. Format your response as clear numbered steps. The problem category is: ${category}. Be concise and practical.`,
          prompt: `Solve this problem: ${problem}`,
        });

        app.logger.info(
          { problem, category, solutionLength: text.length },
          "Solution generated successfully"
        );

        return { solution: text, category };
      } catch (error) {
        app.logger.error(
          { err: error, problem, category },
          "Failed to generate solution"
        );
        throw error;
      }
    }
  );

  fastify.post<{ Body: SolveImageBody }>(
    "/api/solve/image",
    {
      schema: {
        description: "Generate a solution by analyzing an uploaded image",
        tags: ["solve"],
        consumes: ["multipart/form-data"],
        response: {
          200: {
            type: "object",
            properties: {
              solution: { type: "string" },
              imageUrl: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await request.file({ limits: { fileSize: 10 * 1024 * 1024 } });

      if (!data) {
        app.logger.warn("Image solve request without image file");
        return reply.status(400).send({ error: "Image file is required" });
      }

      let buffer: Buffer;
      try {
        buffer = await data.toBuffer();
      } catch (err) {
        app.logger.error({ err }, "Failed to read image file");
        return reply.status(413).send({ error: "File too large" });
      }

      const base64 = buffer.toString("base64");
      const mimeType = data.mimetype;

      app.logger.info(
        { fileName: data.filename, mimeType, fileSize: buffer.length },
        "Processing image for solution"
      );

      try {
        // Get the problem from the form data
        const problemField = await request.file();
        let problem = "Please analyze this image and provide a solution.";

        if (problemField?.fields) {
          const problemValue = (problemField.fields as any)?.problem;
          if (problemValue) {
            problem = problemValue;
          }
        }

        const { text } = await generateText({
          model: gateway("google/gemini-2.5-flash"),
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  image: base64,
                },
                {
                  type: "text",
                  text: `${problem}\n\nProvide fast, actionable, step-by-step solutions. Format your response as clear numbered steps. Be concise and practical.`,
                },
              ],
            },
          ],
        });

        // Upload the image to storage
        const key = `quickfix-images/${Date.now()}-${data.filename}`;
        const uploadedKey = await app.storage.upload(key, buffer);

        // Get signed URL for the image
        const { url: imageUrl } = await app.storage.getSignedUrl(uploadedKey);

        app.logger.info(
          { fileName: data.filename, imageKey: uploadedKey, solutionLength: text.length },
          "Image analyzed and stored successfully"
        );

        return { solution: text, imageUrl };
      } catch (error) {
        app.logger.error(
          { err: error, fileName: data.filename },
          "Failed to analyze image"
        );
        throw error;
      }
    }
  );
}
