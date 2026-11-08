import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // GEMINI API Configuration
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post('/api/scope', requireAuth, async (req: AuthRequest, res) => {
    const { objective } = req.body;
    if (!objective) return res.status(400).json({ error: 'Objective required' });

    try {
      const prompt = `
        You are the Apex Bureau Scoping Engine.
        Break down the following outcome objective into 5-8 Atomic Operational Units (AOUs).
        Objective: "${objective}"
        
        For each AOU, provide:
        - title (string)
        - description (string)
        - estimatedHours (number)
        - dependencies (array of strings, which are the titles of AOUs it depends on)
        - exitCriteria (object with keys being the check and value being true)

        Return ONLY a JSON array of objects.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanText = text.replace(/```json|```/g, '').trim();
      const aous = JSON.parse(cleanText);

      res.json(aous);
    } catch (error) {
      console.error('Scoping error:', error);
      res.status(500).json({ error: 'Failed to generate scope' });
    }
  });

  app.post('/api/cost', requireAuth, async (req: AuthRequest, res) => {
    const { aous, zone } = req.body;
    
    // Simple Monte Carlo simulation for demo
    const iterations = 1000;
    let totalDirectLabor = 0;
    
    const results = [];
    for (let i = 0; i < iterations; i++) {
      let currentIterationCost = 0;
      aous.forEach((aou: any) => {
        const baseRate = 250; // $250/hr
        const variance = 0.8 + Math.random() * 0.4; // 80% to 120%
        currentIterationCost += aou.estimatedHours * baseRate * variance;
      });
      results.push(currentIterationCost);
    }

    results.sort((a, b) => a - b);
    const mean = results.reduce((a, b) => a + b, 0) / iterations;
    const p90 = results[Math.floor(iterations * 0.9)];
    
    res.json({ mean, p90 });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
