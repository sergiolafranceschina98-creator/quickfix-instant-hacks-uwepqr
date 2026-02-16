import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema.js";
import type { App } from "../index.js";

interface SaveHackBody {
  category: string;
  problem: string;
  solution: string;
}

interface DeleteHackParams {
  id: string;
}

export function registerSavedHacksRoutes(app: App, fastify: FastifyInstance) {
  const requireAuth = app.requireAuth();

  fastify.get(
    "/api/saved-hacks",
    {
      schema: {
        description: "Get authenticated user's saved hacks",
        tags: ["saved-hacks"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string" },
                category: { type: "string" },
                problem: { type: "string" },
                solution: { type: "string" },
                createdAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const userId = session.user.id;

      app.logger.info({ userId }, "Fetching saved hacks");

      try {
        const hacks = await app.db
          .select()
          .from(schema.savedHacks)
          .where(eq(schema.savedHacks.userId, userId));

        app.logger.info(
          { userId, hacksCount: hacks.length },
          "Saved hacks retrieved successfully"
        );

        return hacks;
      } catch (error) {
        app.logger.error({ err: error, userId }, "Failed to fetch saved hacks");
        throw error;
      }
    }
  );

  fastify.post<{ Body: SaveHackBody }>(
    "/api/saved-hacks",
    {
      schema: {
        description: "Save a hack for the authenticated user",
        tags: ["saved-hacks"],
        body: {
          type: "object",
          properties: {
            category: { type: "string" },
            problem: { type: "string" },
            solution: { type: "string" },
          },
          required: ["category", "problem", "solution"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
              category: { type: "string" },
              problem: { type: "string" },
              solution: { type: "string" },
              createdAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: SaveHackBody }>, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const userId = session.user.id;
      const { category, problem, solution } = request.body;

      app.logger.info(
        { userId, category, problem: problem.substring(0, 50) },
        "Saving hack"
      );

      try {
        const result = await app.db
          .insert(schema.savedHacks)
          .values({
            userId,
            category,
            problem,
            solution,
          })
          .returning();

        const savedHack = result[0];

        app.logger.info(
          { userId, hackId: savedHack.id, category },
          "Hack saved successfully"
        );

        return savedHack;
      } catch (error) {
        app.logger.error(
          { err: error, userId, category },
          "Failed to save hack"
        );
        throw error;
      }
    }
  );

  fastify.delete<{ Params: DeleteHackParams }>(
    "/api/saved-hacks/:id",
    {
      schema: {
        description: "Delete a saved hack by ID (only if user owns it)",
        tags: ["saved-hacks"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: DeleteHackParams }>, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const userId = session.user.id;
      const { id } = request.params;

      app.logger.info({ userId, hackId: id }, "Deleting hack");

      try {
        // Fetch the hack to verify ownership
        const hack = await app.db
          .select()
          .from(schema.savedHacks)
          .where(eq(schema.savedHacks.id, id));

        if (!hack || hack.length === 0) {
          app.logger.warn({ userId, hackId: id }, "Hack not found");
          return reply.status(404).send({ error: "Hack not found" });
        }

        if (hack[0].userId !== userId) {
          app.logger.warn(
            { userId, hackId: id, hackUserId: hack[0].userId },
            "Unauthorized hack deletion attempt"
          );
          return reply.status(403).send({ error: "Unauthorized" });
        }

        // Delete the hack
        await app.db
          .delete(schema.savedHacks)
          .where(eq(schema.savedHacks.id, id));

        app.logger.info({ userId, hackId: id }, "Hack deleted successfully");

        return { success: true };
      } catch (error) {
        app.logger.error(
          { err: error, userId, hackId: id },
          "Failed to delete hack"
        );
        throw error;
      }
    }
  );
}
