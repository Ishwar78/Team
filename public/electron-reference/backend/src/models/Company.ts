import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  domain: string;
  plan: 'free' | 'starter' | 'business' | 'enterprise';
  settings: {
    screenshot_interval: number;
    idle_threshold: number;
    max_devices_per_user: number;
    blur_screenshots: boolean;
    track_urls: boolean;
    track_apps: boolean;
    working_hours: {
      start: string;
      end: string;
      timezone: string;
    };
    blocked_apps: string[];
    blocked_urls: string[];
  };
  subscription: {
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    stripe_price_id?: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    current_period_end?: Date;
    cancel_at_period_end: boolean;
  };
  max_users: number;
  created_at: Date;
  updated_at: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true, trim: true },
  domain: { type: String, required: true, unique: true, lowercase: true },
  plan: { type: String, enum: ['free', 'starter', 'business', 'enterprise'], default: 'free' },
  settings: {
    screenshot_interval: { type: Number, default: 300 },
    idle_threshold: { type: Number, default: 300 },
    max_devices_per_user: { type: Number, default: 3 },
    blur_screenshots: { type: Boolean, default: false },
    track_urls: { type: Boolean, default: true },
    track_apps: { type: Boolean, default: true },
    working_hours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      timezone: { type: String, default: 'UTC' },
    },
    blocked_apps: [String],
    blocked_urls: [String],
  },
  subscription: {
    stripe_customer_id: String,
    stripe_subscription_id: String,
    stripe_price_id: String,
    status: { type: String, enum: ['active', 'past_due', 'canceled', 'trialing'], default: 'trialing' },
    current_period_end: Date,
    cancel_at_period_end: { type: Boolean, default: false },
  },
  max_users: { type: Number, default: 5 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

CompanySchema.index({ domain: 1 }, { unique: true });
CompanySchema.index({ 'subscription.stripe_customer_id': 1 }, { sparse: true });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
