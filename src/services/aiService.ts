import { GitHubRepo } from '../types/github';

export interface AIAnalysisRequest {
  action:
    | 'explain_code'
    | 'summarize_repo'
    | 'generate_readme'
    | 'security_audit'
    | 'tech_stack_detection'
    | 'compare_repos'
    | 'custom';
  repoData?: Partial<GitHubRepo> & { readmeSnippet?: string };
  compareRepoData?: Partial<GitHubRepo>;
  codeSnippet?: string;
  language?: string;
  customPrompt?: string;
}

export async function requestAIAnalysis(params: AIAnalysisRequest): Promise<string> {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `AI Request Failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.result || 'No response returned from AI.';
}
