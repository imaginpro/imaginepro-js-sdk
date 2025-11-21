/// <reference types="jest" />
import ImagineProSDK, { Types } from '../index';

describe('ImagineProSDK', () => {
  const mockApiKey = 'test-api-key';
  const sdk = new ImagineProSDK({ apiKey: mockApiKey });

  it('should initialize with default values', () => {
    expect(sdk).toBeDefined();
    expect((sdk as any).apiKey).toBe(mockApiKey);
    expect((sdk as any).baseUrl).toBe('https://api.imaginepro.ai');
    expect((sdk as any).defaultTimeout).toBe(1800000);
    expect((sdk as any).fetchInterval).toBe(2000);
  });

  it('should throw an error if fetchMessageOnce is called without a valid messageId', async () => {
    await expect(sdk.fetchMessageOnce('invalid-id')).rejects.toThrow();
  });

  it('should throw a timeout error if fetchMessage exceeds the timeout', async () => {
    jest.spyOn(sdk as any, 'fetchMessageOnce').mockResolvedValue({
      status: 'PROCESSING',
    });

    await expect(sdk.fetchMessage('test-id', 100, 200)).rejects.toThrow('Timeout exceeded while waiting for message status.');
  });

  it('should call imagine with correct API key and return message ID', async () => {
    const mockResponse = { id: 'test-message-id' };
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const prompt = 'test prompt';
    const result = await sdk.imagine({ prompt });

    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.imaginepro.ai/api/v1/nova/imagine',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({ prompt }),
      })
    );
  });

  it('should call universalImagine with contents payload and selected model', async () => {
    const mockResponse = {
      success: true,
      messageId: 'universal-message',
      createdAt: new Date().toISOString(),
    };

    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const contents: Types.GeminiContent[] = [
      { type: 'image', url: 'https://example.com/image.png' },
      { type: 'text', text: 'make her dress in red' },
    ];

    const result = await sdk.universalImagine({
      contents,
      model: 'nano-banana-2',
      ref: 'ref-id',
    });

    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.imaginepro.ai/api/v1/universal/imagine',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({
          contents,
          model: 'nano-banana-2',
          ref: 'ref-id',
        }),
      })
    );
  });
});
