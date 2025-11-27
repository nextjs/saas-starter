import { Schema, model, models, Types } from 'mongoose';

// Team membership subdocument schema (embedded in user)
const TeamMembershipSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    role: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// User schema
const UserSchema = new Schema(
  {
    name: { type: String, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'member', maxlength: 20 },
    deletedAt: { type: Date, default: null },

    // Embedded team memberships for fast lookups
    teamMemberships: [TeamMembershipSchema],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ deletedAt: 1 }, { sparse: true });

// TypeScript interfaces
export interface ITeamMembership {
  teamId: Types.ObjectId;
  role: string;
  joinedAt: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  passwordHash: string;
  role: string;
  deletedAt?: Date | null;
  teamMemberships: ITeamMembership[];
  createdAt: Date;
  updatedAt: Date;
}

// Prevent model recompilation in development
export const User = models.User || model<IUser>('User', UserSchema);
