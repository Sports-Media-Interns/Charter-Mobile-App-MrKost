// CRM API Client - Generic HTTP client for CRM operations

import {
  CRMConfig,
  CRMContact,
  CRMContactCreatePayload,
  CRMContactResponse,
  CRMContactsSearchResponse,
  CRMOpportunity,
  CRMOpportunityCreatePayload,
  CRMOpportunityResponse,
  CRMActivityCreatePayload,
  CRMNoteResponse,
  CRMTaskCreatePayload,
  CRMTaskResponse,
  CRMApiResponse,
  CRMOpportunityStatus,
} from '@/types/crm';

export class CRMApiClient {
  private config: CRMConfig;

  constructor(config: CRMConfig) {
    this.config = config;
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<CRMApiResponse<T>> {
    if (!this.config.enabled) {
      return { success: false, error: 'CRM is disabled' };
    }

    try {
      const url = `${this.config.apiBaseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: this.getHeaders(),
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'API request failed',
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }

  // Contact operations

  async createContact(
    payload: CRMContactCreatePayload
  ): Promise<CRMApiResponse<CRMContactResponse>> {
    return this.request<CRMContactResponse>('POST', '/contacts/', payload);
  }

  async updateContact(
    contactId: string,
    payload: Partial<CRMContactCreatePayload>
  ): Promise<CRMApiResponse<CRMContactResponse>> {
    return this.request<CRMContactResponse>(
      'PUT',
      `/contacts/${contactId}`,
      payload
    );
  }

  async getContact(contactId: string): Promise<CRMApiResponse<CRMContactResponse>> {
    return this.request<CRMContactResponse>('GET', `/contacts/${contactId}`);
  }

  async findContactByEmail(
    email: string
  ): Promise<CRMApiResponse<CRMContactsSearchResponse>> {
    const encodedEmail = encodeURIComponent(email);
    return this.request<CRMContactsSearchResponse>(
      'GET',
      `/contacts/lookup?email=${encodedEmail}`
    );
  }

  async searchContacts(
    query: string
  ): Promise<CRMApiResponse<CRMContactsSearchResponse>> {
    const encodedQuery = encodeURIComponent(query);
    return this.request<CRMContactsSearchResponse>(
      'GET',
      `/contacts/?query=${encodedQuery}`
    );
  }

  async deleteContact(contactId: string): Promise<CRMApiResponse<void>> {
    return this.request<void>('DELETE', `/contacts/${contactId}`);
  }

  async addTagToContact(
    contactId: string,
    tag: string
  ): Promise<CRMApiResponse<CRMContactResponse>> {
    return this.request<CRMContactResponse>(
      'POST',
      `/contacts/${contactId}/tags`,
      { tags: [tag] }
    );
  }

  async removeTagFromContact(
    contactId: string,
    tag: string
  ): Promise<CRMApiResponse<void>> {
    return this.request<void>(
      'DELETE',
      `/contacts/${contactId}/tags`,
      { tags: [tag] }
    );
  }

  // Opportunity operations

  async createOpportunity(
    payload: CRMOpportunityCreatePayload
  ): Promise<CRMApiResponse<CRMOpportunityResponse>> {
    return this.request<CRMOpportunityResponse>(
      'POST',
      '/opportunities/',
      payload
    );
  }

  async updateOpportunity(
    opportunityId: string,
    payload: Partial<CRMOpportunityCreatePayload>
  ): Promise<CRMApiResponse<CRMOpportunityResponse>> {
    return this.request<CRMOpportunityResponse>(
      'PUT',
      `/opportunities/${opportunityId}`,
      payload
    );
  }

  async getOpportunity(
    opportunityId: string
  ): Promise<CRMApiResponse<CRMOpportunityResponse>> {
    return this.request<CRMOpportunityResponse>(
      'GET',
      `/opportunities/${opportunityId}`
    );
  }

  async updateOpportunityStatus(
    opportunityId: string,
    status: CRMOpportunityStatus
  ): Promise<CRMApiResponse<CRMOpportunityResponse>> {
    return this.request<CRMOpportunityResponse>(
      'PUT',
      `/opportunities/${opportunityId}/status`,
      { status }
    );
  }

  async deleteOpportunity(opportunityId: string): Promise<CRMApiResponse<void>> {
    return this.request<void>('DELETE', `/opportunities/${opportunityId}`);
  }

  // Note/Activity operations

  async addNote(
    payload: CRMActivityCreatePayload
  ): Promise<CRMApiResponse<CRMNoteResponse>> {
    return this.request<CRMNoteResponse>(
      'POST',
      `/contacts/${payload.contactId}/notes/`,
      { body: payload.body }
    );
  }

  async addActivity(
    contactId: string,
    activityType: string,
    description: string
  ): Promise<CRMApiResponse<CRMNoteResponse>> {
    const body = `[${activityType}] ${description}`;
    return this.addNote({ contactId, body });
  }

  // Task operations

  async createTask(
    payload: CRMTaskCreatePayload
  ): Promise<CRMApiResponse<CRMTaskResponse>> {
    return this.request<CRMTaskResponse>('POST', '/tasks/', payload);
  }

  async updateTask(
    taskId: string,
    payload: Partial<CRMTaskCreatePayload>
  ): Promise<CRMApiResponse<CRMTaskResponse>> {
    return this.request<CRMTaskResponse>('PUT', `/tasks/${taskId}`, payload);
  }

  async completeTask(taskId: string): Promise<CRMApiResponse<CRMTaskResponse>> {
    return this.request<CRMTaskResponse>('PUT', `/tasks/${taskId}`, {
      completed: true,
    });
  }

  async deleteTask(taskId: string): Promise<CRMApiResponse<void>> {
    return this.request<void>('DELETE', `/tasks/${taskId}`);
  }

  // Utility methods

  isConfigured(): boolean {
    return (
      this.config.enabled &&
      !!this.config.apiBaseUrl &&
      !!this.config.apiKey
    );
  }

  updateConfig(config: Partial<CRMConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
