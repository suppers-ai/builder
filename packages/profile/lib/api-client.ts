/**
 * Profile API Client
 * Handles API requests for user profile operations
 */

export interface ProfileApiClient {
  updateProfile(data: Record<string, any>): Promise<Response>;
  getProfile(): Promise<Response>;
}

export class ProfileApiClientImpl implements ProfileApiClient {
  constructor(private baseUrl: string = '/api/v1') {}

  async updateProfile(data: Record<string, any>): Promise<Response> {
    return fetch(`${this.baseUrl}/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<Response> {
    return fetch(`${this.baseUrl}/user`, {
      method: 'GET',
    });
  }
}

export const profileApiClient = new ProfileApiClientImpl();