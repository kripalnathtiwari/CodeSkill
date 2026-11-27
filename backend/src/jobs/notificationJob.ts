import prisma from "../config/db";

export interface DeliverNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
}

/**
 * Pure business logic: persists an in-app notification row in Postgres.
 */
export const processDeliverNotificationJob = async (
  input: DeliverNotificationInput
): Promise<{ notificationId: string; userId: string; type: string; title: string; message: string }> => {
  const created = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
    },
  });

  return {
    notificationId: created.id,
    userId: created.userId,
    type: created.type,
    title: created.title,
    message: created.message,
  };
};

/**
 * Cursor-based target user ID reader so notification fan-out can dispatch in bounded addBulk batches.
 */
export const fetchNotificationTargetBatch = async (params: {
  role?: string;
  cursorUserId?: string;
  batchSize?: number;
}): Promise<string[]> => {
  const take = params.batchSize ?? 100;
  const users = await prisma.user.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      ...(params.role ? { role: params.role } : {}),
    },
    ...(params.cursorUserId ? { skip: 1, cursor: { id: params.cursorUserId } } : {}),
    take,
    orderBy: { id: "asc" },
    select: { id: true },
  });

  return users.map((u) => u.id);
};
