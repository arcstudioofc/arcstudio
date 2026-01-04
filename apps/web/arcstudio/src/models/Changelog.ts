import { Schema, model, models } from "mongoose";

import { ChangelogType } from "@/constants/changelogTypes";

const ChangelogSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: Object.values(ChangelogType),
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Changelog =
  models.Changelog || model("Changelog", ChangelogSchema);
