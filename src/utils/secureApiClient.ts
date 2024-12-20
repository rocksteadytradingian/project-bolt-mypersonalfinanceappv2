import { encrypt, decrypt, generateSecureToken } from './encryption';

interface SecureRequestConfig extends RequestInit {
  encryptPayload?: boolean;
}

class SecureApiClient {
  private static instance: SecureApiClient;
  private readonly baseHeaders: HeadersInit;

  private constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'X-Client-Token': generateSecureToken(),
    };
  }

  public static getInstance(): SecureApiClient {
    if (!SecureApiClient.instance) {
      SecureApiClient.instance = new SecureApiClient();
    }
    return SecureApiClient.instance;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    try {
      // Attempt to decrypt the response if it's encrypted
      const decrypted = decrypt(data);
      return JSON.parse(decrypted);
    } catch {
      // If decryption fails, assume the response is not encrypted
      return JSON.parse(data);
    }
  }

  private async prepareRequest(
    url: string,
    config: SecureRequestConfig = {}
  ): Promise<Request> {
    const headers = new Headers(this.baseHeaders);

    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.append(key, value);
      });
    }

    // Add timestamp for request freshness
    headers.append('X-Request-Timestamp', Date.now().toString());

    let body = config.body;
    if (body && config.encryptPayload) {
      body = encrypt(typeof body === 'string' ? body : JSON.stringify(body));
    }

    return new Request(url, {
      ...config,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async get<T>(url: string, config: SecureRequestConfig = {}): Promise<T> {
    const request = await this.prepareRequest(url, {
      ...config,
      method: 'GET',
    });
    const response = await fetch(request);
    return this.handleResponse(response);
  }

  public async post<T>(
    url: string,
    data: any,
    config: SecureRequestConfig = {}
  ): Promise<T> {
    const request = await this.prepareRequest(url, {
      ...config,
      method: 'POST',
      body: data,
    });
    const response = await fetch(request);
    return this.handleResponse(response);
  }

  public async put<T>(
    url: string,
    data: any,
    config: SecureRequestConfig = {}
  ): Promise<T> {
    const request = await this.prepareRequest(url, {
      ...config,
      method: 'PUT',
      body: data,
    });
    const response = await fetch(request);
    return this.handleResponse(response);
  }

  public async delete<T>(url: string, config: SecureRequestConfig = {}): Promise<T> {
    const request = await this.prepareRequest(url, {
      ...config,
      method: 'DELETE',
    });
    const response = await fetch(request);
    return this.handleResponse(response);
  }
}

export const secureApiClient = SecureApiClient.getInstance();
