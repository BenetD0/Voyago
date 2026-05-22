import AuditLog from "@/models/AuditLog";

type AuditPayload = {
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog(payload: AuditPayload) {
  try {
    await AuditLog.create({
      actorEmail: payload.actorEmail,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId || "",
      summary: payload.summary,
      metadata: payload.metadata || {},
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
