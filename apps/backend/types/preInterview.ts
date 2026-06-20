import { z } from "zod";
import { normalizeUrl, extractGithubUsername, extractLinkedinUsername } from "../utils/validateUrls";

export const preInterviewSchema = z.object({
  github: z
    .string()
    .trim()
    .url("GitHub URL must be a valid URL")
    .transform((url) => normalizeUrl(url))
    .refine((url) => extractGithubUsername(url) !== null, {
      message: "Must be a valid GitHub profile URL (github.com/{username}) with no extra path segments",
    }),

  linkedin: z
    .string()
    .trim()
    .url("LinkedIn URL must be a valid URL")
    .transform((url) => normalizeUrl(url))
    .refine((url) => extractLinkedinUsername(url) !== null, {
      message: "Must be a valid LinkedIn profile URL (linkedin.com/in/{username})",
    }),
});

export type PreInterviewInput = z.infer<typeof preInterviewSchema>;
