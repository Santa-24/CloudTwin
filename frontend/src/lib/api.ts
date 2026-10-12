import { 
  ArchitectureSchema, 
  Project, 
  SimulationScenario, 
  SimulationResult, 
  CostEstimate, 
  SecurityOverview, 
  ArchitectureRecommendation, 
  UnifiedAnalysisResult, 
  UserProfile 
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cloudtwin_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });

      const json = await response.json();
      if (!response.ok || json.success === false) {
        throw new Error(json.error?.message || `Request failed with status ${response.status}`);
      }
      return json.data;
    } catch (err: any) {
      console.warn(`API call to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // --- Auth ---
  async guestLogin(): Promise<{ user: UserProfile; access_token: string }> {
    return this.request('/auth/guest', { method: 'POST' });
  }

  async getCurrentUser(): Promise<UserProfile> {
    return this.request('/auth/me');
  }

  async login(email: string, password: string): Promise<{ user: UserProfile; access_token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async signup(email: string, password: string, fullName: string): Promise<{ user: UserProfile; access_token: string }> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName })
    });
  }

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    return this.request('/projects');
  }

  async getProject(id: string): Promise<{ project: Project; architectures: ArchitectureSchema[]; reports: any[] }> {
    return this.request(`/projects/${id}`);
  }

  async createProject(name: string, description: string, defaultRegion: string = 'ap-south-1', tags: string[] = [], template: string = 'enterprise_11_service'): Promise<Project> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description, default_region: defaultRegion, tags, template })
    });
  }

  async deleteProject(id: string): Promise<{ deleted_id: string }> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Architectures ---
  async getArchitectures(projectId?: string): Promise<ArchitectureSchema[]> {
    const query = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/architectures${query}`);
  }

  async getArchitecture(id: string): Promise<ArchitectureSchema> {
    return this.request(`/architectures/${id}`);
  }

  async saveArchitecture(id: string, updates: Partial<ArchitectureSchema>): Promise<ArchitectureSchema> {
    return this.request(`/architectures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async validateArchitecture(id: string): Promise<{ valid: boolean; total_nodes: number; total_connections: number; issues: any[] }> {
    return this.request(`/architectures/${id}/validate`, { method: 'POST' });
  }

  async getVersions(architectureId: string): Promise<any[]> {
    return this.request(`/architectures/${architectureId}/versions`);
  }

  async createVersion(architectureId: string, changeSummary: string): Promise<any> {
    return this.request(`/architectures/${architectureId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ change_summary: changeSummary })
    });
  }

  async restoreVersion(architectureId: string, versionId: string): Promise<ArchitectureSchema> {
    return this.request(`/architectures/${architectureId}/versions/${versionId}/restore`, {
      method: 'POST'
    });
  }

  // --- Simulations ---
  async getScenarios(): Promise<SimulationScenario[]> {
    return this.request('/simulations/scenarios');
  }

  async runSimulation(architectureId: string, scenarioId: string, customParams: Record<string, any> = {}): Promise<UnifiedAnalysisResult> {
    return this.request('/simulations/run', {
      method: 'POST',
      body: JSON.stringify({
        architecture_id: architectureId,
        scenario_id: scenarioId,
        custom_parameters: customParams
      })
    });
  }

  // --- Cost & Security & Recommendations ---
  async getCostEstimate(architectureId: string, currency: string = 'USD'): Promise<CostEstimate> {
    return this.request(`/cost/${architectureId}?currency=${currency}`);
  }

  async getSecurityAnalysis(architectureId: string): Promise<SecurityOverview> {
    return this.request(`/security/${architectureId}`);
  }

  async getRecommendations(architectureId: string): Promise<ArchitectureRecommendation[]> {
    return this.request(`/recommendations/${architectureId}`);
  }

  // --- Reports ---
  async generateReport(projectId: string, architectureId: string, title: string, format: string = 'markdown'): Promise<any> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        architecture_id: architectureId,
        title,
        format
      })
    });
  }

  async getProjectReports(projectId: string): Promise<any[]> {
    return this.request(`/reports/project/${projectId}`);
  }
}

export const api = new ApiClient();
