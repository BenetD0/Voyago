import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      default: "",
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "journeysync_audit_logs",
  }
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
