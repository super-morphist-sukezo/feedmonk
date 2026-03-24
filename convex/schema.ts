import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  transformations: defineTable({
    // 既存ドキュメントとの互換のため optional で残す
    originalText: v.optional(v.string()),
    mode: v.optional(v.string()),
    mildnessLevel: v.optional(v.number()),
    result: v.object({
      coreEmotion: v.string(),
      patternA: v.string(),
      patternB: v.string(),
      patternC: v.string(),
      explanation: v.string(),
      poeticTranslation: v.optional(v.string()),
    }),
  }),
});
