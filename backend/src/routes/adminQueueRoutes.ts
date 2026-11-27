import { Router } from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { allQueues } from "../queues";
import { atsQueue } from "../jobs/queues/atsQueue";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";

/**
 * Bull Board dashboard mounted at /admin/queues behind JWT + ADMIN role check.
 */
export const createAdminQueuesRouter = (): Router => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");

  createBullBoard({
    queues: [...allQueues, atsQueue].map((q) => new BullMQAdapter(q)),
    serverAdapter,
  });

  const router = Router();
  router.use(authenticateJWT, requireRole(["ADMIN"]));
  router.use(serverAdapter.getRouter());
  return router;
};
