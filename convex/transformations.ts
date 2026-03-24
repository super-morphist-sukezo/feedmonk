import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    result: v.object({
      headline: v.optional(v.string()),
      coreEmotion: v.string(),
      patternA: v.string(),
      patternB: v.string(),
      patternC: v.string(),
      explanation: v.optional(v.string()),
      poeticTranslation: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transformations", { result: args.result });
  },
});
