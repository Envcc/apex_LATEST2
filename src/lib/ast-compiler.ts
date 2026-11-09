/**
 * @file src/lib/ast-compiler.ts
 * @summary AST IR Specifications, Zod Formal Validation Schemas & Ingestion Normalizer.
 * 
 * CURRENT STATE:
 * - Sanitizes raw Gemini token streams (strips Markdown fences).
 * - Enforces MandateASTSchema via Zod (UUIDs, URLs, positive duration, SHA-256 digests).
 * - Throws explicit validation errors on malformed payloads.
 * 
 * FUTURE ROADMAP:
 * 1. Support domain-specific custom exit assertion schemas (e.g. Kubernetes CRD, gRPC health checks).
 * 2. Add automatic auto-fix normalizers for soft type mismatches before rejection.
 */

import { z } from 'zod';

export const ExitCriterionTypeSchema = z.enum([
  'API_ENDPOINT',
  'CRYPTO_HASH',
  'CONTAINER_EXIT',
  'HUMAN_AUDIT'
]);

export const ExitCriterionSchema = z.object({
  id: z.string().uuid(),
  type: ExitCriterionTypeSchema,
  assertionEndpoint: z.string().url(),
  expectedStatusCode: z.number().int().min(100).max(599).default(200),
  expectedPayloadHash: z.string().length(64) // Mandatory SHA-256 Digest
});

export const AtomicOperationalUnitSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string().min(10),
  dependsOn: z.array(z.string().uuid()),
  estimatedHours: z.number().positive(),
  complexityScalar: z.number().min(1.0).max(3.0).default(1.0),
  allocatedFee: z.number().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).default('PENDING'),
  exitCriteria: z.array(ExitCriterionSchema).min(1)
});

export const MandateASTSchema = z.object({
  targetDirective: z.string().min(10),
  units: z.array(AtomicOperationalUnitSchema).min(1)
});

export type MandateAST = z.infer<typeof MandateASTSchema>;
export type AtomicOperationalUnit = z.infer<typeof AtomicOperationalUnitSchema>;
export type ExitCriterion = z.infer<typeof ExitCriterionSchema>;
export type ExitCriterionType = z.infer<typeof ExitCriterionTypeSchema>;

export function parseAndValidateCandidateAST(rawLLMOutput: string): MandateAST {
  let cleaned = rawLLMOutput.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  let parsedObject: unknown;
  try {
    parsedObject = JSON.parse(cleaned);
  } catch (err: any) {
    throw new Error(`AST Ingestion Failure: Payload is not valid JSON. ${err.message}`);
  }

  const astResult = MandateASTSchema.safeParse(parsedObject);
  if (!astResult.success) {
    const errorIssues = astResult.error.issues
      .map(issue => `[${issue.path.join('.')}: ${issue.message}]`)
      .join('; ');
    throw new Error(`AST Validation Error: ${errorIssues}`);
  }

  return astResult.data;
}
