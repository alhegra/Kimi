import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";

export const uploadRouter = createRouter({
  getSignature: authedQuery
    .input(
      z.object({
        folder: z.string().default("katib"),
      }).optional()
    )
    .query(async ({ input }) => {
      const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || "";
      const apiKey = process.env.VITE_CLOUDINARY_API_KEY || "";
      const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET || "";

      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = input?.folder ?? "katib";

      const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

      const crypto = await import("crypto");
      const signature = crypto
        .createHash("sha1")
        .update(stringToSign)
        .digest("hex");

      return {
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
      };
    }),
});
