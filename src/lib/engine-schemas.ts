import { z } from 'zod';

export const AOUExitCriterionSchema = z.object({
  condition: z.string(),
  assertion: z.string(),
  expectedValue: z.string()
});

export const AOUSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  dependsOn: z.array(z.string()), // Array of titles or IDs
  estimatedHours: z.number().positive(),
  exitCriteria: z.array(AOUExitCriterionSchema)
});

export const ScopingASTSchema = z.object({
  targetOutcome: z.string(),
  units: z.array(AOUSchema)
});

export type ScopingAST = z.infer<typeof ScopingASTSchema>;
export type AOU = z.infer<typeof AOUSchema>;
