interface BaseParams {
  ref?: string; // Reference id which will sent to webhook
  webhookOverride?: string; // Webhook URL for receiving generation result callbacks, the response is like MessageResponse
  timeout?: number; // Timeout in seconds
  disableCdn?: boolean; // Whether to disable CDN
}

interface ImagineParams extends BaseParams {
  prompt: string;
}

interface ImagineResponse {
  messageId: string; // Unique identifier for the image generation task
  success: 'PROCESSING' | 'QUEUED' | 'DONE' | 'FAIL'; // Task status
  createdAt?: string; // If the task is completed, returns the generated image URL
  error?: string; // If the task fails, returns the error message
}

interface ErrorResponse {
  message: string; // Unique identifier for the image generation task
  error?: string; // If the task fails, returns the error message
  statusCode: number; // HTTP status code
}

interface MessageResponse {
  messageId: string; // Unique identifier for the message
  prompt: string; // The prompt used for image generation
  originalUrl?: string; // Original image URL
  uri?: string; // Generated image URL
  progress: number; // Progress percentage
  status: 'PROCESSING' | 'QUEUED' | 'DONE' | 'FAIL'; // Current status of the message
  createdAt?: string; // Creation timestamp
  updatedAt?: string; // Last update timestamp
  buttons?: string[]; // Available action buttons
  originatingMessageId?: string; // ID of the originating message
  ref?: string; // Reference information
  error?: string; // If the task fails, returns the error message
}

interface ImagineProSDKOptions {
  apiKey: string; // API key for authentication
  baseUrl?: string; // Base URL for the API
  defaultTimeout?: number; // Default timeout for requests
  fetchInterval?: number; // Interval for polling the message status
}

enum buttons {
  U1 = 'U1',  // Upscale button 1
  U2 = 'U2',  // Upscale button 2
  U3 = 'U3',  // Upscale button 3
  U4 = 'U4',  // Upscale button 4
  V1 = 'V1',  // Variant button 1
  V2 = 'V2',  // Variant button 2
  V3 = 'V3',  // Variant button 3
  V4 = 'V4',  // Variant button 4
  '🔄' = '🔄',   // Reroll button
  'Zoom Out 2x' = 'Zoom Out 2x', // Zoom Out button (2x)
  'Zoom Out 1.5x' = 'Zoom Out 1.5x', // Zoom Out button (1.5x)
  'Vary (Strong)' = 'Vary (Strong)', // Strong variation button
  'Vary (Subtle)' = 'Vary (Subtle)', // Subtle variation button
  'Vary (Region)' = 'Vary (Region)', // Region variation button
  '⬅️' = '⬅️',   // Left pan button
  '➡️' = '➡️',   // Right pan button
  '⬆️' = '⬆️',   // Up pan button
  '⬇️' = '⬇️',   // Down pan button
  'Make Square' = 'Make Square', // Make square button
  'Upscale (2x)' = 'Upscale (2x)', // Upscale button (2x)
  'Upscale (4x)' = 'Upscale (4x)', // Upscale button (4x)
  'Cancel Job' = 'Cancel Job', // Cancel job button
  'Upscale (Creative)' = 'Cancel Job', // Cancel job button'
  'Upscale (Subtle)' = 'Upscale (Subtle)', // Upscale button (Subtle)
}

interface ButtonPressParams extends BaseParams {
  messageId: string; // Unique identifier for the message
  button: string; // Button identifier (e.g., "U1")
  mask?: string; // Optional mask for the Vary Region action
  prompt?: string; // Optional prompt for the Vary Region action
}

interface UpscaleParams extends BaseParams {
  messageId: string; // Unique identifier for the message
  index: number; // Index of the button to upscale
}

interface VariantParams extends BaseParams {
  messageId: string; // Unique identifier for the message
  index: number; // Index of the button to generate a variant
}

interface RerollParams extends BaseParams {
  messageId: string; // Unique identifier for the message
}

interface InpaintingParams extends BaseParams {
  messageId: string; // Unique identifier for the message
  mask: string; // Mask for the region to vary, required
  prompt?: string; // Optional prompt for the inpainting
}

// ImagineProSDK class for interacting with the Imagine Pro API
class ImagineProSDK {
  private apiKey: string;
  private baseUrl: string; // Default base URL
  private defaultTimeout: number; // Default timeout for requests in milliseconds
  private fetchInterval: number; // Default interval for polling the message status

  constructor({ apiKey, baseUrl, defaultTimeout, fetchInterval }: ImagineProSDKOptions) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://api.imaginepro.ai';
    this.defaultTimeout = defaultTimeout || 1800000; // 30 minutes
    this.fetchInterval = fetchInterval || 2000; // 2 seconds
  }

  async imagine(params: ImagineParams): Promise<ImagineResponse> {
    return this.postRequest('/api/v1/nova/imagine', params);
  }

  async fetchMessageOnce(messageId: string): Promise<MessageResponse> {
    const endpoint = `/api/v1/message/fetch/${messageId}`;
    const messageStatus = await this.getRequest<MessageResponse>(endpoint);
    console.log('Message status:', messageStatus.status, 'progress:',  messageStatus.progress);

    return messageStatus;
  }

  async fetchMessage(messageId: string, interval = this.fetchInterval, timeout = this.defaultTimeout): Promise<MessageResponse> {
    const startTime = Date.now();

    while (true) {
      const messageStatus = await this.fetchMessageOnce(messageId);

      if (messageStatus.status === 'DONE' || messageStatus.status === 'FAIL') {
        return messageStatus;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout exceeded while waiting for message status.');
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  async pressButton(params: ButtonPressParams): Promise<ImagineResponse> {
    return this.postRequest('/api/v1/nova/button', params);
  }

  async upscale(params: UpscaleParams): Promise<ImagineResponse> {
    const button = `U${params.index}`;
    return this.pressButton({
      messageId: params.messageId,
      button,
    });
  }

  async variant(params: VariantParams): Promise<ImagineResponse> {
    const button = `V${params.index}`;
    return this.pressButton({
      messageId: params.messageId,
      button,
    });
  }

  async reroll(params: RerollParams): Promise<ImagineResponse> {
    return this.pressButton({
      messageId: params.messageId,
      button: '🔄',
    });
  }

  async inpainting(params: InpaintingParams): Promise<ImagineResponse> {
    return this.pressButton({
      messageId: params.messageId,
      button: 'Vary (Region)',
      mask: params.mask,
      prompt: params.prompt,
    });
  }

  private async getRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || `Error fetching data: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  private async postRequest<T>(endpoint: string, body: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || `Error posting data: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('Error posting data:', error);
      throw error;
    }
  }
}

export default ImagineProSDK;
