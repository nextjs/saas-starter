import { Schema, model, models, Types } from 'mongoose';

// Invitation schema
const InvitationSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    teamName: { type: String }, // Denormalized for display
    email: { type: String, required: true, maxlength: 255, lowercase: true },
    role: { type: String, required: true, maxlength: 50 },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedByName: { type: String }, // Denormalized for display
    invitedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'pending', maxlength: 20 },
  },
  {
    timestamps: false, // We manually manage invitedAt
  }
);

// Compound index for fast invitation lookups
InvitationSchema.index({ email: 1, teamId: 1, status: 1 });
InvitationSchema.index({ teamId: 1 });

// TypeScript interface
export interface IInvitation {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  teamName?: string;
  email: string;
  role: string;
  invitedBy: Types.ObjectId;
  invitedByName?: string;
  invitedAt: Date;
  status: string;
}

// Prevent model recompilation in development
export const Invitation =
  models.Invitation || model<IInvitation>('Invitation', InvitationSchema);
