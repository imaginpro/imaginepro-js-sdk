# imaginepro-js-sdk

[![npm version](https://img.shields.io/npm/v/imaginepro.svg)](https://www.npmjs.com/package/imaginepro)
[![License](https://img.shields.io/npm/l/imaginepro.svg)](https://github.com/imaginpro/imaginepro-js-sdk/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/imaginepro.svg)](https://www.npmjs.com/package/imaginepro)
[![Build Status](https://img.shields.io/github/workflow/status/imaginpro/imaginepro-js-sdk/CI)](https://github.com/imaginpro/imaginepro-js-sdk/actions)
[![Dependencies](https://img.shields.io/librariesio/release/npm/imaginepro)](https://libraries.io/npm/imaginepro)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/imaginpro/imaginepro-js-sdk/blob/main/CONTRIBUTING.md)

Official SDK of [Imaginepro](https://platform.imaginepro.ai/midjourney-api?utm_source=github), your professional AI image generation platform with enterprise-grade stability and scalability.

Imaginepro offers state-of-the-art AI image generation capabilities with:

- 🚀 Enterprise-grade API with high availability
- 🎨 High-quality image generation with advanced AI models
- ⚡ Fast processing speed and optimized performance
- 🛠️ Rich image manipulation features including upscaling, variants and inpainting
- 🔒 Secure and stable service with professional support
- 💰 Flexible pricing plans for different business needs

## Key Features

- **Text-to-Image Generation**: Create stunning images from text descriptions
- **Gemini AI Integration**: Multi-modal image generation with image and text inputs
- **Video Generation**: Create videos from start and end frame images using Midjourney
- **Image Upscaling**: Enhance image resolution while maintaining quality
- **Image Variants**: Generate alternative versions of existing images
- **Inpainting**: Selectively modify specific areas of an image
- **Webhook Support**: Integrate with your workflow using custom callbacks
- **Progress Tracking**: Monitor generation progress in real-time
- **Enterprise Support**: Professional technical support and SLA

## Table of Contents

- [Get Started](#get-started)
- [Quick Start](#quick-start)
- [API Methods](#api-methods)
  - [Imagine](#imagine)
  - [Gemini Imagine](#gemini-imagine)
  - [Universal Imagine](#universal-imagine)
  - [Video Generation](#video-generation)
  - [Buttons](#buttons)
  - [Upscale](#upscale)
  - [Variant](#variant)
  - [Reroll](#reroll)
  - [Inpainting](#inpainting)
  - [Fetch Message](#fetch-message)
- [Webhook Support](#with-webhook)
- [Init Options](#init-options)
- [Message Response](#message-response)

## Get Started

```bash
npm i imaginepro -S
```

## Quick Start

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

## API Methods

### Imagine

The `imagine` method allows you to generate an image based on a text prompt.

```ts
const imagineResponse = await instance.imagine({
    prompt: 'a futuristic cityscape at sunset',
});
console.log('Imagine response:', imagineResponse);
```

### Buttons

The `pressButton` method allows you to interact with buttons associated with a message. You can specify the `messageId`, `button` identifier.

```ts
const buttonResponse = await instance.pressButton({
    messageId: 'your-message-id',
    button: 'U1',
});
console.log('Button press response:', buttonResponse);
```

### Upscale

The `upscale` method allows you to upscale an image by interacting with the button 'U1' using the provided `messageId` and `index`.

```ts
const buttonResponse = await instance.upscale({
    messageId: 'your-message-id',
    index: 1, // Corresponds to button 'U1'
});
console.log('Upscale response:', buttonResponse);
```

### Variant

The `variant` method allows you to generate a variant of an image by interacting with a variant button using the provided `messageId` and `index`.

```ts
const buttonResponse = await instance.variant({
    messageId: 'your-message-id',
    index: 1, // Corresponds to button 'V1'
});
console.log('Variant response:', buttonResponse);
```

### Reroll

The `reroll` method allows you to regenerate an image using the provided `messageId`.

```ts
const rerollResponse = await instance.reroll({
    messageId: 'your-message-id',
});
console.log('Reroll response:', rerollResponse);
```

### Inpainting

The `inpainting` method allows you to vary a specific region of an image using the provided `messageId` and `mask`. You can create mask by this [tool](https://mask.imaginepro.ai/)

```ts
const inpaintingResponse = await instance.inpainting({
    messageId: 'your-message-id',
    mask: 'xxx',
});
console.log('Inpainting response:', inpaintingResponse);
```

### Gemini Imagine

The `geminiImagine` method allows you to generate images using the Gemini/Nanobanana model with multi-modal inputs (combining images and text).

```ts
const geminiResponse = await instance.geminiImagine({
    contents: [
        { type: 'image', url: 'https://example.com/input-image.png' },
        { type: 'text', text: 'make her dress in red' }
    ],
    model: 'gemini-2.5-flash-image-preview', // Optional, or use 'flux-1.1-pro'
});
console.log('Gemini response:', geminiResponse);

// Poll for completion
const result = await instance.fetchMessage(geminiResponse.messageId);
console.log('Generated image:', result.uri);
```

#### Parameters

- `contents` (array, required): Array of content objects with `type` ('image' or 'text'), `url` (for images), and `text` (for text).
- `model` (string, optional): Model to use. Defaults to `"gemini-2.5-flash-image-preview"`. Alternative: `"flux-1.1-pro"`.
- Supports all base parameters: `ref`, `webhookOverride`, `timeout`, `disableCdn`.

### Universal Imagine

The `universalImagine` method exposes the Edit/Generate Image API (`/api/v1/universal/imagine`) which supports the newest Gemini/Nanobanana models and is optimized for image-to-image edits that include both image URLs and text instructions.

```ts
const universalResponse = await instance.universalImagine({
    contents: [
        { type: 'image', url: 'https://xxxx.supabase.co/storage/v1/object/public/example.png' },
        { type: 'text', text: 'make her dress in red' },
    ],
    model: 'nano-banana-2', // Optional: nano-banana, gemini-2.5-flash-image-preview, gemini-3-pro-image-preview
    ref: 'custom-job-reference',
});
console.log('Universal Imagine response:', universalResponse);

const universalResult = await instance.fetchMessage(universalResponse.messageId);
console.log('Universal Imagine result:', universalResult);
```

#### Parameters

- `contents` (array, required): Multi-modal blocks describing the edit. Each block must include a `type` field (`'image'` or `'text'`) plus the corresponding `url` or `text`.
- `model` (string, optional): Defaults to `"nano-banana"`. Supported models: `"nano-banana"`, `"nano-banana-2"`, `"gemini-2.5-flash-image-preview"`, `"gemini-3-pro-image-preview"`.
- Inherits base parameters such as `ref`, `webhookOverride`, `timeout`, and `disableCdn`.

#### Returns

An object containing the `success` flag, `messageId`, `createdAt` timestamp, and optional `error`. Use `fetchMessage` just like other tasks to retrieve the final asset.

### Video Generation

#### Generate Video

The `generateVideo` method creates a video from start and end frame images using Midjourney's video generation.

```ts
const videoResponse = await instance.generateVideo({
    prompt: 'smooth transition animation',
    startFrameUrl: 'https://example.com/start-frame.png',
    endFrameUrl: 'https://example.com/end-frame.png',
    timeout: 900, // 15 minutes recommended for video generation
});
console.log('Video generation initiated:', videoResponse);

// Poll for video completion
const video = await instance.fetchVideoMessage(videoResponse.messageId);
console.log('Generated video:', video.videoUrl);
console.log('Available results:', video.results);
```

#### Extend Video

The `extendVideo` method extends a previously generated video by selecting one of the results.

```ts
const extendResponse = await instance.extendVideo({
    messageId: 'your-video-message-id',
    index: 0, // Choose which result to extend
    animateMode: 'smooth', // Optional animation mode
    timeout: 900,
});
console.log('Video extension initiated:', extendResponse);

// Poll for extended video completion
const extendedVideo = await instance.fetchVideoMessage(extendResponse.messageId);
console.log('Extended video:', extendedVideo.videoUrl);
```

#### Fetch Video Message

The `fetchVideoMessage` method polls for video generation status until completion.

```ts
const videoStatus = await instance.fetchVideoMessage(
    'your-video-message-id',
    2000, // Polling interval (optional)
    900000 // Timeout in milliseconds (optional, defaults to 15 minutes)
);
console.log('Video status:', videoStatus);
```

### Fetch Message

The `fetchMessage` method allows you to retrieve the status and details of a specific message using its `messageId`. This method polls the message status until it is either `DONE` or `FAIL`.

```ts
const messageResponse = await instance.fetchMessage('your-message-id');
console.log('Message response:', messageResponse);
```

#### Parameters

- `messageId` (string): The unique identifier for the message.
- `interval` (number, optional): The polling interval in milliseconds. Defaults to 2000ms.
- `timeout` (number, optional): The maximum time to wait for the message status in milliseconds. Defaults to 30 minutes.

#### Returns

A `MessageResponse` object containing details such as the `status`, `progress`, and generated image URL (if successful).

#### Example

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

## With Webhook

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

## Properties

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
