// Types and Interfaces
namespace Types {
  // Base Parameter Types
  export interface BaseParams {
    ref?: string; // Reference id which will be sent to webhook
    webhookOverride?: string; // Webhook URL for receiving generation result callbacks
    timeout?: number; // Timeout in seconds
    disableCdn?: boolean; // Whether to disable CDN
  }

  // Request Parameter Types
  export interface ImagineParams extends BaseParams {
    prompt: string;
  }

  export interface ButtonPressParams extends BaseParams {
    messageId: string; // Unique identifier for the message
    button: string; // Button identifier (e.g., "U1")
    mask?: string; // Optional mask for the Vary Region action
    prompt?: string; // Optional prompt for the Vary Region action
  }

  export interface UpscaleParams extends BaseParams {
    messageId: string; // Unique identifier for the message
    index: number; // Index of the button to upscale
  }

  export interface VariantParams extends BaseParams {
    messageId: string; // Unique identifier for the message
    index: number; // Index of the button to generate a variant
  }

  export interface RerollParams extends BaseParams {
    messageId: string; // Unique identifier for the message
  }

  export interface InpaintingParams extends BaseParams {
    messageId: string; // Unique identifier for the message
    mask: string; // Mask for the region to vary, required
    prompt?: string; // Optional prompt for the inpainting
  }

  // Gemini API Types
  export interface GeminiContent {
    type: 'image' | 'text'; // Content type
    url?: string; // Image URL (required for type: 'image')
    text?: string; // Text content (required for type: 'text')
  }

  export interface GeminiImagineParams extends BaseParams {
    contents: GeminiContent[]; // Array of content objects (images and text)
    model?: string; // Model to use (default: "gemini-2.5-flash-image-preview", alternative: "flux-1.1-pro")
  }

  // Video API Types
  export interface VideoGenerateParams extends BaseParams {
    prompt: string; // Text prompt for video generation
    startFrameUrl: string; // URL of the start frame image
    endFrameUrl: string; // URL of the end frame image
  }

  export interface VideoExtendParams extends BaseParams {
    messageId: string; // Unique identifier for the video message
    index: number; // Index of the result to extend
    animateMode?: string; // Animation mode
  }

  export interface VideoMessageResponse extends MessageResponse {
    videoUrl?: string; // Generated video URL
    results?: Array<{ url: string; index: number }>; // Array of video results
  }

  // Response Types
  export interface ImagineResponse {
    messageId: string; // Unique identifier for the image generation task
    success: 'PROCESSING' | 'QUEUED' | 'DONE' | 'FAIL'; // Task status
    createdAt?: string; // If the task is completed, returns the created timestamp
    error?: string; // If the task fails, returns the error message
  }

  export interface ErrorResponse {
    message: string; // Error message
    error?: string; // Detailed error information
    statusCode: number; // HTTP status code
  }

  export interface MessageResponse {
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

  // Configuration
  export interface ImagineProSDKOptions {
    apiKey: string; // API key for authentication
    baseUrl?: string; // Base URL for the API
    defaultTimeout?: number; // Default timeout for requests in milliseconds
    fetchInterval?: number; // Interval for polling the message status in milliseconds
  }
}

// Available button actions
enum Button {
  U1 = 'U1',  // Upscale button 1
  U2 = 'U2',  // Upscale button 2
  U3 = 'U3',  // Upscale button 3
  U4 = 'U4',  // Upscale button 4
  V1 = 'V1',  // Variant button 1
  V2 = 'V2',  // Variant button 2
  V3 = 'V3',  // Variant button 3
  V4 = 'V4',  // Variant button 4
  REROLL = '🔄',   // Reroll button
  ZOOM_OUT_2X = 'Zoom Out 2x', // Zoom Out button (2x)
  ZOOM_OUT_1_5X = 'Zoom Out 1.5x', // Zoom Out button (1.5x)
  VARY_STRONG = 'Vary (Strong)', // Strong variation button
  VARY_SUBTLE = 'Vary (Subtle)', // Subtle variation button
  VARY_REGION = 'Vary (Region)', // Region variation button
  PAN_LEFT = '⬅️',   // Left pan button
  PAN_RIGHT = '➡️',   // Right pan button
  PAN_UP = '⬆️',   // Up pan button
  PAN_DOWN = '⬇️',   // Down pan button
  MAKE_SQUARE = 'Make Square', // Make square button
  UPSCALE_2X = 'Upscale (2x)', // Upscale button (2x)
  UPSCALE_4X = 'Upscale (4x)', // Upscale button (4x)
  CANCEL_JOB = 'Cancel Job', // Cancel job button
  UPSCALE_CREATIVE = 'Upscale (Creative)', // Fixed: was incorrectly mapped to Cancel Job
  UPSCALE_SUBTLE = 'Upscale (Subtle)', // Upscale button (Subtle)
}

/**
 * ImagineProSDK class for interacting with the Imagine Pro AI image generation API
 */
class ImagineProSDK {
  private apiKey: string;
  private baseUrl: string;
  private defaultTimeout: number;
  private fetchInterval: number;

  /**
   * Initialize the SDK with configuration options
   */
  constructor({ 
    apiKey, 
    baseUrl = 'https://api.imaginepro.ai', 
    defaultTimeout = 1800000, // 30 minutes
    fetchInterval = 2000 // 2 seconds
  }: Types.ImagineProSDKOptions) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
    this.fetchInterval = fetchInterval;
  }

  /**
   * Generate an image with the given prompt
   */
  async imagine(params: Types.ImagineParams): Promise<Types.ImagineResponse> {
    return this.postRequest('/api/v1/nova/imagine', params);
  }

  /**
   * Fetch the status of a message once
   */
  async fetchMessageOnce(messageId: string): Promise<Types.MessageResponse> {
    const endpoint = `/api/v1/message/fetch/${messageId}`;
    const messageStatus = await this.getRequest<Types.MessageResponse>(endpoint);
    console.log('Message status:', messageStatus.status, 'progress:', messageStatus.progress);
    return messageStatus;
  }

  /**
   * Poll for message status until completion or timeout
   */
  async fetchMessage(
    messageId: string, 
    interval = this.fetchInterval, 
    timeout = this.defaultTimeout
  ): Promise<Types.MessageResponse> {
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

  /**
   * Press a button on an existing image generation
   */
  async pressButton(params: Types.ButtonPressParams): Promise<Types.ImagineResponse> {
    return this.postRequest('/api/v1/nova/button', params);
  }

  /**
   * Upscale a generated image
   */
  async upscale(params: Types.UpscaleParams): Promise<Types.ImagineResponse> {
    const button = `U${params.index}`;
    return this.pressButton({
      messageId: params.messageId,
      button,
      ...this.extractBaseParams(params)
    });
  }

  /**
   * Create a variant of a generated image
   */
  async variant(params: Types.VariantParams): Promise<Types.ImagineResponse> {
    const button = `V${params.index}`;
    return this.pressButton({
      messageId: params.messageId,
      button,
      ...this.extractBaseParams(params)
    });
  }

  /**
   * Regenerate an image with the same prompt
   */
  async reroll(params: Types.RerollParams): Promise<Types.ImagineResponse> {
    return this.pressButton({
      messageId: params.messageId,
      button: Button.REROLL,
      ...this.extractBaseParams(params)
    });
  }

  /**
   * Apply inpainting to modify a specific region of an image
   */
  async inpainting(params: Types.InpaintingParams): Promise<Types.ImagineResponse> {
    return this.pressButton({
      messageId: params.messageId,
      button: Button.VARY_REGION,
      mask: params.mask,
      prompt: params.prompt,
      ...this.extractBaseParams(params)
    });
  }

  /**
   * Generate an image using Gemini/Nanobanana model
   */
  async geminiImagine(params: Types.GeminiImagineParams): Promise<Types.ImagineResponse> {
    return this.postRequest('/api/v1/gemini/imagine', params);
  }

  /**
   * Generate a video from start and end frame images using Midjourney video generation
   */
  async generateVideo(params: Types.VideoGenerateParams): Promise<Types.ImagineResponse> {
    return this.postRequest('/api/v1/video/mj/generate', params);
  }

  /**
   * Extend a generated video by choosing one result from the previous response
   */
  async extendVideo(params: Types.VideoExtendParams): Promise<Types.ImagineResponse> {
    return this.postRequest('/api/v1/video/mj/extend', params);
  }

  /**
   * Fetch the status of a video message once
   */
  async fetchVideoMessageOnce(messageId: string): Promise<Types.VideoMessageResponse> {
    const endpoint = `/api/v1/video/mj/fetch/${messageId}`;
    const messageStatus = await this.getRequest<Types.VideoMessageResponse>(endpoint);
    console.log('Video message status:', messageStatus.status, 'progress:', messageStatus.progress);
    return messageStatus;
  }

  /**
   * Poll for video message status until completion or timeout
   */
  async fetchVideoMessage(
    messageId: string,
    interval = this.fetchInterval,
    timeout = this.defaultTimeout
  ): Promise<Types.VideoMessageResponse> {
    const startTime = Date.now();

    while (true) {
      const messageStatus = await this.fetchVideoMessageOnce(messageId);

      if (messageStatus.status === 'DONE' || messageStatus.status === 'FAIL') {
        return messageStatus;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout exceeded while waiting for video message status.');
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  /**
   * Extract base parameters from a params object
   */
  private extractBaseParams(params: Types.BaseParams): Types.BaseParams {
    const { ref, webhookOverride, timeout, disableCdn } = params;
    return { ref, webhookOverride, timeout, disableCdn };
  }

  /**
   * Make a GET request to the API
   */
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
        const errorResponse = await response.json() as Types.ErrorResponse;
        throw new Error(errorResponse.error || `Error fetching data: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  /**
   * Make a POST request to the API
   */
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
        const errorResponse = await response.json() as Types.ErrorResponse;
        throw new Error(errorResponse.error || `Error posting data: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('Error posting data:', error);
      throw error;
    }
  }
}

export { ImagineProSDK, Button, Types };
export default ImagineProSDK;
