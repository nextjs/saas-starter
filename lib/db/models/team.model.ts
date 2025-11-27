import { Schema, model, models, Types } from 'mongoose';

// Team member subdocument schema (embedded in team)
const TeamMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String },
    email: { type: String, required: true },
    role: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Team schema
const TeamSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100 },

    // Stripe integration fields
    stripeCustomerId: { type: String, unique: true, sparse: true },
    stripeSubscriptionId: { type: String, unique: true, sparse: true },
    stripeProductId: { type: String },
    planName: { type: String, maxlength: 50 },
    subscriptionStatus: { type: String, maxlength: 20 },

    // Denormalized members for fast team page loads
    members: [TeamMemberSchema],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes for performance
TeamSchema.index({ stripeCustomerId: 1 }, { unique: true, sparse: true });
TeamSchema.index({ stripeSubscriptionId: 1 }, { unique: true, sparse: true });

// TypeScript interfaces
export interface ITeamMember {
  userId: Types.ObjectId;
  name?: string;
  email: string;
  role: string;
  joinedAt: Date;
}

export interface ITeam {
  _id: Types.ObjectId;
  name: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeProductId?: string;
  planName?: string;
  subscriptionStatus?: string;
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

// Prevent model recompilation in development
export const Team = models.Team || model<ITeam>('Team', TeamSchema);
