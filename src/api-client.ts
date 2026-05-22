/**
 * Descript API Client
 *
 * Base URL: https://descriptapi.com/v1
 * Auth: Bearer token (Authorization: Bearer TOKEN)
 * Request bodies: application/json
 * Responses: JSON
 * Pagination: cursor-based (next_cursor)
 */

const BASE_URL = 'https://descriptapi.com/v1';

export class DescriptClient {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: Record<string, any>;
      params?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params } = options;
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Accept': 'application/json',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 204) return {} as T;

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Descript API Error ${response.status}: ${text}`);
    }

    return response.json();
  }

  // ===== Projects =====

  async listProjects(opts?: {
    name?: string;
    folder_path?: string;
    created_by?: string;
    created_after?: string;
    created_before?: string;
    updated_after?: string;
    updated_before?: string;
    sort_by?: string;
    sort_direction?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/projects', {
      params: {
        name: opts?.name,
        folder_path: opts?.folder_path,
        created_by: opts?.created_by,
        created_after: opts?.created_after,
        created_before: opts?.created_before,
        updated_after: opts?.updated_after,
        updated_before: opts?.updated_before,
        sort_by: opts?.sort_by,
        sort_direction: opts?.sort_direction,
        limit: opts?.limit,
        cursor: opts?.cursor,
      },
    });
  }

  async getProject(projectId: string) {
    return this.request<any>(`/projects/${encodeURIComponent(projectId)}`);
  }

  // ===== Jobs =====

  async listJobs(opts?: {
    project_id?: string;
    type?: string;
    created_after?: string;
    created_before?: string;
    limit?: number;
    cursor?: string;
  }) {
    return this.request<any>('/jobs', {
      params: {
        project_id: opts?.project_id,
        type: opts?.type,
        created_after: opts?.created_after,
        created_before: opts?.created_before,
        limit: opts?.limit,
        cursor: opts?.cursor,
      },
    });
  }

  async getJob(jobId: string) {
    return this.request<any>(`/jobs/${encodeURIComponent(jobId)}`);
  }

  async cancelJob(jobId: string) {
    return this.request<any>(`/jobs/${encodeURIComponent(jobId)}`, {
      method: 'DELETE',
    });
  }

  // ===== Import Media =====

  async importMedia(opts: {
    project_name?: string;
    project_id?: string;
    add_media?: Record<string, { url?: string; content_type?: string; file_size?: number }>;
    add_compositions?: {
      name?: string;
      tracks?: { media_name: string }[];
    }[];
    callback_url?: string;
  }) {
    return this.request<any>('/jobs/import/project_media', {
      method: 'POST',
      body: opts,
    });
  }

  // ===== Agent Edit =====

  async agentEdit(opts: {
    project_id?: string;
    project_name?: string;
    composition_id?: string;
    prompt: string;
    callback_url?: string;
  }) {
    return this.request<any>('/jobs/agent', {
      method: 'POST',
      body: opts,
    });
  }

  // ===== Publish =====

  async publishProject(opts: {
    project_id: string;
    composition_id?: string;
    media_type?: string;
    resolution?: string;
    access_level?: string;
    callback_url?: string;
  }) {
    return this.request<any>('/jobs/publish', {
      method: 'POST',
      body: opts,
    });
  }

  // ===== Published Projects =====

  async getPublishedProject(slug: string) {
    return this.request<any>(`/published_projects/${encodeURIComponent(slug)}`);
  }
}
