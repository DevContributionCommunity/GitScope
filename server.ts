import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI endpoint for code explanation, repo architecture breakdown, and documentation
app.post('/api/ai/analyze', async (req, res) => {
  try {
    if (!ai) {
      // In case GEMINI_API_KEY is not configured yet, provide a graceful fallback message
      return res.status(200).json({
        result: 'Gemini AI API key is not configured yet in Settings > Secrets. You can inspect repositories and code directly using the built-in browser explorer.',
      });
    }

    const { action, repoData, codeSnippet, language, customPrompt } = req.body;

    let prompt = '';
    if (action === 'explain_code') {
      prompt = `You are a senior software architect on OpenRepoLens. Analyze and explain this ${language || 'code'} file:
- Summarize primary function and design pattern.
- Break down key functions/components.
- Point out potential bugs, edge-cases, performance bottlenecks, or security caveats.
- Provide practical recommendations to improve readability or safety.

Code snippet:
\`\`\`${language || ''}
${codeSnippet}
\`\`\``;
    } else if (action === 'summarize_repo') {
      prompt = `You are OpenRepoLens AI repository analyzer. Provide a comprehensive architectural overview of this GitHub repository:
Repository: ${repoData?.name || 'Unknown'}
Description: ${repoData?.description || 'None provided'}
Language: ${repoData?.language || 'Multi-language'}
Stars: ${repoData?.stargazers_count ?? 0} | Forks: ${repoData?.forks_count ?? 0} | Open Issues: ${repoData?.open_issues_count ?? 0}
Topics: ${(repoData?.topics || []).join(', ')}
${repoData?.readmeSnippet ? `README extract:\n${repoData.readmeSnippet.slice(0, 2500)}` : ''}

Deliver a crisp, structured review:
1. Executive Summary: What problem does this solve?
2. Architecture & Tech Stack: Best practices, detected dependencies, structure.
3. Code Quality & Community Health: Is it production-ready, active, or experimental?
4. Key Recommendations: What would you suggest the author improve?`;
    } else if (action === 'generate_readme') {
      prompt = `Generate a modern, clean, production-grade README.md for the following repository:
Name: ${repoData?.name}
Description: ${repoData?.description}
Primary Language: ${repoData?.language}
Topics: ${(repoData?.topics || []).join(', ')}
Owner: ${repoData?.owner?.login || 'User'}

Include badges, overview, features list, quick start/installation commands, and license notice. Keep it professional.`;
    } else if (action === 'security_audit') {
      prompt = `You are a DevSecOps security expert on OpenRepoLens. Perform a security & health audit on this repository:
Repository: ${repoData?.name}
Description: ${repoData?.description}
Language: ${repoData?.language}
License: ${repoData?.license?.name || 'No detected license'}
Archived: ${repoData?.archived ? 'Yes' : 'No'}
Open Issues: ${repoData?.open_issues_count}
Topics: ${(repoData?.topics || []).join(', ')}
${codeSnippet ? `Manifest / Code snippet:\n${codeSnippet.slice(0, 3000)}` : ''}

Provide a structured assessment:
1. License & Legal Hygiene: (Is it open source approved? Any commercial risks?)
2. Maintenance & Deprecation Status: (Activity freshness, abandonment risk)
3. Supply Chain & Dependency Security: (Known vulnerabilities or best practices for ${repoData?.language})
4. Actionable Security Checklist for Maintainers`;
    } else if (action === 'tech_stack_detection') {
      prompt = `You are a software architect on OpenRepoLens. Analyze this repository and manifest to identify its complete technology stack:
Repository: ${repoData?.name}
Primary Language: ${repoData?.language}
Topics: ${(repoData?.topics || []).join(', ')}
${codeSnippet ? `Manifest content (e.g. package.json or requirements.txt):\n${codeSnippet.slice(0, 3000)}` : ''}

Categorize and explain:
- Framework & Core Runtime
- State Management & Data Fetching
- UI / Styling Library
- Build Tools & Bundler
- Testing & Linting
- Infrastructure / Deployment target recommendation`;
    } else if (action === 'compare_repos') {
      prompt = `You are an open source analyst on OpenRepoLens. Compare these two GitHub repositories:
Repo 1: ${repoData?.name} (${repoData?.language}, ⭐ ${repoData?.stargazers_count}, 🍴 ${repoData?.forks_count})
Description: ${repoData?.description}

Repo 2: ${req.body.compareRepoData?.name} (${req.body.compareRepoData?.language}, ⭐ ${req.body.compareRepoData?.stargazers_count}, 🍴 ${req.body.compareRepoData?.forks_count})
Description: ${req.body.compareRepoData?.description}

Deliver an objective technical comparison:
1. Core Focus & Architectural Philosophy
2. Community Adoption & Maintenance Velocity
3. Performance & Ergonomics Trade-offs
4. Recommendation: When to choose Repo 1 vs Repo 2`;
    } else {
      prompt = customPrompt || `Provide an insightful developer analysis for this repository.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ result: response.text ?? 'No response generated.' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI insights' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
