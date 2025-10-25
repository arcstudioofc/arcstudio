import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: string; // email
  name?: string | null;
  account?: {
    bannerUrl?: string | null;
    isVerified?: boolean;
    followers: string[];
    following: string[];
  };
  image?: string | null;
  provider?: string | null;
  discordId?: string | null;
  posts: IPost[]; // posts como subdocumentos
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    hash: { type: String, default: null },
    content: { type: String, required: true },
    githubUrl: { type: String, default: null },
    bannerUrl: { type: String, default: null },
    edited: {
      isEdited: { type: Boolean, default: false },
      editedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true }, // email
    name: { type: String, default: null, unique: true },
    account: {
      bannerUrl: { type: String, default: null },
      description: { type: String, default: null },
      isVerified: { type: Boolean, default: false },
      followers: { type: [String], default: [] },
      following: { type: [String], default: [] },
    },
    image: { type: String, default: null },
    provider: { type: String, default: null },
    discordId: { type: String, default: null, unique: true },
    isAdmin: { type: Boolean, default: false },
    posts: [PostSchema], // posts como subdocumentos
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Reuse model if already compiled
export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
