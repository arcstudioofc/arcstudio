import { Schema, model, models } from "mongoose";

const OfficialProjectSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    authors: { type: [String], required: true },
    infos: {
      images: {
        banner: { type: String, required: true },
      },
      links: {
        website: { type: String },
        github: { type: String },
      },
    },
  },
  { timestamps: true }
);

export const OfficialProject =
  models.OfficialProject || model("OfficialProject", OfficialProjectSchema);
