import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';
import { RiskSimulationParams, RiskSimulationResult } from '../src/lib/simulation-engine.ts';

export class SimulationWorkerPool {
  private poolSize: number;
  private workerScript: string;

  constructor(workerScriptPath: string, customPoolSize?: number) {
    this.poolSize = customPoolSize || Math.max(1, cpus().length - 1);
    this.workerScript = workerScriptPath;
  }

  public async executeSimulation(params: RiskSimulationParams): Promise<RiskSimulationResult> {
    return new Promise((resolve, reject) => {
      // Use tsx to run the worker script in this environment
      const worker = new Worker(`
        const { register } = require('tsx/esm/api');
        register();
        require('${this.workerScript}');
      `, {
        eval: true,
        workerData: params
      });

      worker.on('message', (result: RiskSimulationResult) => {
        worker.terminate();
        resolve(result);
      });

      worker.on('error', (err) => {
        worker.terminate();
        reject(err);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
}
