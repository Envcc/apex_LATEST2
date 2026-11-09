/**
 * @file src/lib/simulation-engine.ts
 * @summary Fat-Tailed Log-Normal Monte Carlo Actuarial Risk Engine.
 * 
 * CURRENT STATE:
 * - Uses Box-Muller transformations to generate standard normal variates Z ~ N(0,1).
 * - Transforms to Log-Normal Pareto cost distribution: X = exp(mu + sigma * Z).
 * - Scales sigma dynamically based on unit complexity multipliers (1.0 to 3.0).
 * - Calculates sorted P50, P80, P90, and P99 tail risk metrics.
 * 
 * FUTURE ROADMAP:
 * 1. Port core transform inner loops to C++/Rust WebAssembly (WASM) for SIMD acceleration.
 * 2. Feed historical execution telemetry to dynamically recalibrate base volatility parameters.
 */

export interface RiskSimulationParams {
  baseCost: number;
  complexityMultiplier: number; // 1.0 (Standard) to 3.0 (Critical Heavy Infrastructure)
  iterations?: number;
}

export interface RiskSimulationResult {
  p50Cost: number;
  p80Cost: number;
  p90Cost: number;
  p99TailRisk: number;
  variance: number;
  rawDist: number[];
}

/**
 * Log-Normal Monte Carlo Simulation for Heavy-Tailed Risk Distribution
 */
export function computeFatTailedMonteCarlo(params: RiskSimulationParams): RiskSimulationResult {
  const { baseCost, complexityMultiplier, iterations = 1000 } = params;
  const results: number[] = new Array(iterations);

  // Adjust standard volatility (sigma) based on task complexity
  const sigma = 0.20 * Math.max(1.0, complexityMultiplier);
  const mu = Math.log(baseCost) - 0.5 * Math.pow(sigma, 2);

  for (let i = 0; i < iterations; i++) {
    // Box-Muller Transform to generate standard normal variate Z ~ N(0,1)
    let u1 = 0;
    let u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();

    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    // Log-Normal Transformation: X = exp(mu + sigma * z)
    results[i] = Math.exp(mu + sigma * z);
  }

  // Sort results ascending
  results.sort((a, b) => a - b);

  const p50Index = Math.floor(iterations * 0.50);
  const p80Index = Math.floor(iterations * 0.80);
  const p90Index = Math.floor(iterations * 0.90);
  const p99Index = Math.floor(iterations * 0.99);

  const mean = results.reduce((acc, v) => acc + v, 0) / iterations;
  const variance = results.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / iterations;

  return {
    p50Cost: Number(results[p50Index].toFixed(2)),
    p80Cost: Number(results[p80Index].toFixed(2)),
    p90Cost: Number(results[p90Index].toFixed(2)),
    p99TailRisk: Number(results[p99Index].toFixed(2)),
    variance: Number(variance.toFixed(2)),
    rawDist: results
  };
}

export function calculateComplexityMultiplier(units: any[]): number {
  const base = 1.0;
  const unitFactor = units.length * 0.05;
  const dependencyFactor = units.reduce((acc, u) => acc + (u.dependsOn?.length || 0), 0) * 0.1;
  return Math.min(3.0, base + unitFactor + dependencyFactor);
}
