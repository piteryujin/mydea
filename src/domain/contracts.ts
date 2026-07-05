import { z } from "zod";

export const ideaStatusSchema = z.enum(["captured", "refining", "analyzed"]);
export type IdeaStatus = z.infer<typeof ideaStatusSchema>;

export const refinementQuestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2),
  hint: z.string().min(2),
});
export type RefinementQuestion = z.infer<typeof refinementQuestionSchema>;

export const refineResponseSchema = z.object({
  questions: z.array(refinementQuestionSchema).min(2).max(3),
});
export type RefineResponse = z.infer<typeof refineResponseSchema>;

export const feasibilitySchema = z.object({
  level: z.enum(["낮음", "보통", "높음"]),
  score: z.number().int().min(1).max(5),
  rationale: z.string().min(10),
  biggestBlocker: z.string().min(5),
});

export const analysisSchema = z.object({
  title: z.string().min(2).max(60),
  summary: z.string().min(10),
  targetCustomer: z.string().min(5),
  problem: z.string().min(5),
  valueProposition: z.string().min(5),
  feasibility: feasibilitySchema,
  assumptions: z.array(z.string().min(3)).min(2).max(5),
  risks: z.array(z.string().min(3)).min(2).max(5),
  mvp: z.object({
    mustHave: z.array(z.string().min(2)).min(2).max(5),
    exclude: z.array(z.string().min(2)).min(2).max(5),
  }),
  nextActions: z.array(z.string().min(3)).length(3),
  validationPlan: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        task: z.string().min(5),
        successSignal: z.string().min(3),
      }),
    )
    .length(7),
  killCriteria: z.array(z.string().min(3)).min(2).max(4),
  disclaimer: z.literal("이 분석은 검증 전 가설이며 실제 고객 반응으로 확인해야 합니다."),
});
export type Analysis = z.infer<typeof analysisSchema>;

export const answerSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  answer: z.string().min(1),
});
export type IdeaAnswer = z.infer<typeof answerSchema>;

export const ideaSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  rawText: z.string().min(5),
  status: ideaStatusSchema,
  title: z.string(),
  questions: z.array(refinementQuestionSchema),
  answers: z.array(answerSchema),
  analysis: analysisSchema.nullable(),
  completedActions: z.array(z.number().int().min(0).max(2)),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Idea = z.infer<typeof ideaSchema>;

export const refineRequestSchema = z.object({
  ideaText: z.string().trim().min(10).max(3000),
});

export const analyzeRequestSchema = z.object({
  ideaText: z.string().trim().min(10).max(3000),
  answers: z.array(answerSchema).min(2).max(3),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
