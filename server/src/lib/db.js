import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

/**
 * Runs `fn` inside a transaction with app.user_id set, so Postgres
 * row-level security only exposes this user's drafts, answers,
 * document versions and consultations.
 *
 * Usage in a route:
 *   const draft = await withUser(req.user.id, (tx) =>
 *     tx.draft.findUnique({ where: { id }, include: { values: true } })
 *   );
 *
 * Requires DATABASE_URL to use a NON-owner role (app_user), otherwise RLS is bypassed.
 * While developing as the owner, also filter by userId in your queries.
 */
export async function withUser(userId, fn) {
  return prisma.$transaction(async (tx) => {
    // third argument true = local to this transaction only
    await tx.$executeRaw`SELECT set_config('app.user_id', ${userId}, true)`;
    return fn(tx);
  });
}

/** Append-only audit helper. Call it from every service. */
export async function audit(tx, userId, action, entity) {
  await tx.auditLog.create({ data: { userId, action, entity } });
}