import { parentPort, workerData } from 'node:worker_threads';
import { computeFatTailedMonteCarlo } from '../src/lib/simulation-engine.ts';

if (parentPort) {
  const result = computeFatTailedMonteCarlo(workerData);
  parentPort.postMessage(result);
}
