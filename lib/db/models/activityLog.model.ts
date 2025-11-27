import { Schema, model, models, Types } from 'mongoose';

// Activity log schema
const ActivityLogSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String }, // Denormalized for display
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, maxlength: 45 },
  },
  {
    timestamps: false, // We manually manage timestamp
  }
);

// Compound index for user activity feed queries
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ teamId: 1 });

// TypeScript interface
export interface IActivityLog {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  userId?: Types.ObjectId;
  userName?: string;
  action: string;
  timestamp: Date;
  ipAddress?: string;
}

// Prevent model recompilation in development
export const ActivityLog =
  models.ActivityLog || model<IActivityLog>('ActivityLog', ActivityLogSchema);
