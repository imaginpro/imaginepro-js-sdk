# imaginepro-js-sdk

Official SDK of [Imaginepro](https://platform.imaginepro.ai/), your professional AI image generation platform with enterprise-grade stability and scalability.

Imaginepro offers state-of-the-art AI image generation capabilities with:

- 🚀 Enterprise-grade API with high availability
- 🎨 High-quality image generation with advanced AI models
- ⚡ Fast processing speed and optimized performance
- 🛠️ Rich image manipulation features including upscaling, variants and inpainting
- 🔒 Secure and stable service with professional support
- 💰 Flexible pricing plans for different business needs

## Key Features

- Text-to-Image Generation: Create stunning images from text descriptions
- Image Upscaling: Enhance image resolution while maintaining quality
- Image Variants: Generate alternative versions of existing images
- Inpainting: Selectively modify specific areas of an image
- Webhook Support: Integrate with your workflow using custom callbacks
- Progress Tracking: Monitor generation progress in real-time
- Enterprise Support: Professional technical support and SLA

## Get Started

```bash
npm i imaginepro -S
```

## Quick start

```ts
import ImagineProSDK from 'imaginepro';

const instance = new ImagineProSDK({
    apiKey: 'sk-xxxx',
    baseUrl: 'https://api.imaginepro.ai', // Optional, defaults to 'https://api.imaginepro.ai'
    timeout: 300000, // Optional, defaults to 30 minutes (in milliseconds)
});

(async () => {
    try {
        const result = await instance.imagine({
            prompt: 'a pretty cat playing with a puppy',
        });
        console.log('Image generation initiated:', result);

        const imagine = await instance.fetchMessage(result.messageId);
        console.log('Image generation result:', imagine);
    } catch (error) {
        console.error('Error:', error);
    }
})();
```

## Imagine

The `imagine` method allows you to generate an image based on a text prompt.

```ts
const imagineResponse = await instance.imagine({
    prompt: 'a futuristic cityscape at sunset',
});
console.log('Imagine response:', imagineResponse);
```

## Buttons

The `pressButton` method allows you to interact with buttons associated with a message. You can specify the `messageId`, `button` identifier.

```ts
const buttonResponse = await instance.pressButton({
    messageId: 'your-message-id',
    button: 'U1',
});
console.log('Button press response:', buttonResponse);
```

## Upscale

The `upscale` method allows you to upscale an image by interacting with the button 'U1' using the provided `messageId` and `index`.

```ts
const buttonResponse = await instance.upscale({
    messageId: 'your-message-id',
    index: 1, // Corresponds to button 'U1'
});
console.log('Upscale response:', buttonResponse);
```

## Variant

The `variant` method allows you to generate a variant of an image by interacting with a variant button using the provided `messageId` and `index`.

```ts
const buttonResponse = await instance.variant({
    messageId: 'your-message-id',
    index: 1, // Corresponds to button 'V1'
});
console.log('Variant response:', buttonResponse);
```

## Reroll

The `reroll` method allows you to regenerate an image using the provided `messageId`.

```ts
const rerollResponse = await instance.reroll({
    messageId: 'your-message-id',
});
console.log('Reroll response:', rerollResponse);
```

## Inpainting

The `inpainting` method allows you to vary a specific region of an image using the provided `messageId` and `mask`. You can create mask by this [tool](https://mask.imaginepro.ai/)

```ts
const inpaintingResponse = await instance.inpainting({
    messageId: 'your-message-id',
    mask: 'xxx',
});
console.log('Inpainting response:', inpaintingResponse);
```

## Fetch Message

The `fetchMessage` method allows you to retrieve the status and details of a specific message using its `messageId`. This method polls the message status until it is either `DONE` or `FAIL`.

```ts
const messageResponse = await instance.fetchMessage('your-message-id');
console.log('Message response:', messageResponse);
```

### Parameters

- `messageId` (string): The unique identifier for the message.
- `interval` (number, optional): The polling interval in milliseconds. Defaults to 2000ms.
- `timeout` (number, optional): The maximum time to wait for the message status in milliseconds. Defaults to 30 minutes.

### Returns

A `MessageResponse` object containing details such as the `status`, `progress`, and generated image URL (if successful).

### Example

```ts
(async () => {
    try {
        const messageResponse = await instance.fetchMessage('your-message-id');
        console.log('Message details:', messageResponse);
    } catch (error) {
        console.error('Error fetching message:', error);
    }
})();
```

## With webhook

You can use the optional parameters `ref` and `webhookOverride` to customize the behavior of the SDK when generating images.

- `ref`: A reference ID that will be sent to the webhook for tracking purposes.
- `webhookOverride`: A custom webhook URL to receive callbacks for generation results.

Example:

```ts
const imagineResponse = await instance.imagine({
    prompt: 'a serene mountain landscape',
    ref: 'custom-reference-id', // Optional reference ID
    webhookOverride: 'https://your-custom-webhook.url/callback', // Optional custom webhook URL
});
console.log('Imagine response with webhook:', imagineResponse);
```

When using `webhookOverride`, the generation result will be sent to the specified webhook URL instead of the default one configured in your account.

The webhook payload will include details exactly the same as the response of `fetchMessage`.

## Init Options

The `ImagineProSDK` constructor accepts the following options:

- `apiKey` (string, required): Your API key for authentication.
- `baseUrl` (string, optional): The base URL for the API. Defaults to `https://api.imaginepro.ai`.
- `defaultTimeout` (number, optional): The default timeout for requests in milliseconds. Defaults to 30 minutes (1800000ms).
- `fetchInterval` (number, optional): The interval for polling the message status in milliseconds. Defaults to 2000ms.

### Example

```ts
const sdk = new ImagineProSDK({
    apiKey: 'your-api-key',
    baseUrl: 'https://api.custom-url.com', // Optional
    defaultTimeout: 60000, // Optional, 1 minute
    fetchInterval: 1000, // Optional, 1 second
});
```

## Message Response

The `MessageResponse` object contains details about the status and result of a message.

### Properties

- `messageId` (string): The unique identifier for the message.
- `prompt` (string): The prompt used for image generation.
- `originalUrl` (string, optional): The original image URL.
- `uri` (string, optional): The generated image URL.
- `progress` (number): The progress percentage of the task.
- `status` (string): The current status of the message. Possible values are:
  - `PROCESSING`
  - `QUEUED`
  - `DONE`
  - `FAIL`
- `createdAt` (string, optional): The timestamp when the message was created.
- `updatedAt` (string, optional): The timestamp when the message was last updated.
- `buttons` (string[], optional): The available action buttons for the message.
- `originatingMessageId` (string, optional): The ID of the originating message, if applicable.
- `ref` (string, optional): Reference information provided during the request.
- `error` (string, optional): The error message, if the task fails.

### Example

```ts
const messageResponse: MessageResponse = {
    messageId: 'abc123',
    prompt: 'a futuristic cityscape at sunset',
    uri: 'https://cdn.imaginepro.ai/generated-image.jpg',
    progress: 100,
    status: 'DONE',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:05:00Z',
    buttons: ['U1', 'V1'],
    ref: 'custom-reference-id',
};
console.log('Message Response:', messageResponse);
```
