/**
 * @file src/lib/dag-validator.ts
 * @summary Topological Directed Acyclic Graph (DAG) Formal Validator.
 * 
 * CURRENT STATE:
 * - Verifies prerequisite parent ID references exist in the same contract.
 * - Performs Depth-First Search (DFS) with recursion stack tracking to mathematically prove zero circular deadlocks.
 * - Rejects non-DAG graphs prior to persistence.
 * 
 * FUTURE ROADMAP:
 * 1. Calculate and output critical path execution duration.
 * 2. Group nodes into parallel execution tiers for concurrent worker dispatch.
 */

import { MandateAST } from './ast-compiler';

export function assertValidAOUDAG(ast: MandateAST): void {
  const graph = new Map<string, string[]>();
  const allNodeIds = new Set<string>();

  for (const unit of ast.units) {
    allNodeIds.add(unit.id);
    graph.set(unit.id, unit.dependsOn);
  }

  // 1. Invariant: Check that all prerequisite parent node IDs exist in the contract
  for (const unit of ast.units) {
    for (const parentId of unit.dependsOn) {
      if (!allNodeIds.has(parentId)) {
        throw new Error(
          `DAG Deadlock Violation: Unit [${unit.title || unit.id}] references non-existent parent dependency [${parentId}]`
        );
      }
    }
  }

  // 2. Invariant: Depth-First Search for cycle detection
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const parentDependencies = graph.get(nodeId) || [];
    for (const parentId of parentDependencies) {
      if (!visited.has(parentId)) {
        if (dfs(parentId)) return true;
      } else if (recursionStack.has(parentId)) {
        return true; // Circular loop detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const unit of ast.units) {
    if (!visited.has(unit.id)) {
      if (dfs(unit.id)) {
        throw new Error(
          `DAG Cycle Detected: Circular dependency loop detected starting at node [${unit.title || unit.id}]`
        );
      }
    }
  }
}
