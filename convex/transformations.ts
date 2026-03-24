import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    result: v.object({
      coreEmotion: v.string(),
      patternA: v.string(),
      patternB: v.string(),
      patternC: v.string(),
      explanation: v.string(),
      poeticTranslation: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transformations", { result: args.result });
  },
});