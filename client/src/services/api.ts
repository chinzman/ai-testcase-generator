import { GenerateResponse, TestSuite, TestDimension, TestCase, SystemHealth } from '../types/index.js';

const API_BASE = '/api';

export function getStoredApiKey(): string {
  return localStorage.getItem('es_user_api_key') || '';
}

export function setStoredApiKey(key: string) {
  if (key) {
    localStorage.setItem('es_user_api_key', key);
  } else {
    localStorage.removeItem('es_user_api_key');
  }
}

export function getStoredProvider(): 'openai' | 'claude' | 'auto' {
  return (localStorage.getItem('es_user_provider') as any) || 'auto';
}

export function setStoredProvider(provider: 'openai' | 'claude' | 'auto') {
  localStorage.setItem('es_user_provider', provider);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const storedKey = getStoredApiKey();
  if (storedKey && !headers['x-api-key']) {
    headers['x-api-key'] = storedKey;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data.error?.message || `Request failed with status ${response.status}`;
    const error: any = new Error(errorMsg);
    error.code = data.error?.code;
    error.details = data.error?.details;
    throw error;
  }

  return data.data;
}

export const api = {
  async generateTestCases(
    requirement: string,
    dimensions: TestDimension[],
    userApiKey?: string,
    provider?: 'openai' | 'claude' | 'auto'
  ): Promise<GenerateResponse> {
    return request<GenerateResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify({
        requirement,
        dimensions,
        userApiKey: userApiKey || getStoredApiKey() || undefined,
        provider: provider || getStoredProvider(),
      }),
    });
  },

  async refineTestCases(
    requirement: string,
    previousTestCases: TestCase[],
    feedbackPrompt: string,
    userApiKey?: string,
    provider?: 'openai' | 'claude' | 'auto'
  ): Promise<GenerateResponse> {
    return request<GenerateResponse>('/refine', {
      method: 'POST',
      body: JSON.stringify({
        requirement,
        previousTestCases,
        feedbackPrompt,
        userApiKey: userApiKey || getStoredApiKey() || undefined,
        provider: provider || getStoredProvider(),
      }),
    });
  },

  async saveSuite(suite: {
    title: string;
    rawRequirement: string;
    modelUsed: string;
    qualityScore?: number;
    qualityFeedback?: string;
    testCases: TestCase[];
  }): Promise<TestSuite> {
    return request<TestSuite>('/suites', {
      method: 'POST',
      body: JSON.stringify(suite),
    });
  },

  async listSuites(): Promise<any[]> {
    return request<any[]>('/suites');
  },

  async getSuite(id: string): Promise<TestSuite> {
    return request<TestSuite>(`/suites/${id}`);
  },

  async updateSuite(id: string, payload: { title?: string; testCases?: TestCase[] }): Promise<TestSuite> {
    return request<TestSuite>(`/suites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteSuite(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/suites/${id}`, {
      method: 'DELETE',
    });
  },

  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/healthz`);
    return res.json();
  },

  async getReadiness(): Promise<{ status: string; database: string; aiEngine: string }> {
    const res = await fetch(`${API_BASE}/readyz`);
    return res.json();
  },
};
