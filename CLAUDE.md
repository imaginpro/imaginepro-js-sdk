# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **imaginepro-js-sdk**, an official TypeScript/JavaScript SDK for the Imaginepro AI image generation platform. The SDK provides a clean API wrapper for interacting with Imaginepro's REST API, which supports various AI image generation operations including text-to-image, upscaling, variants, and inpainting.

**Key Points:**
- This is an NPM package published as `imaginepro`
- Single-file architecture: all code is in `src/index.ts`
- Target: Node.js >= 18.x
- Built with TypeScript, outputs CommonJS to `dist/`

## Development Commands

```bash
# Build the TypeScript to JavaScript
npm run build

# Run all tests
npm test

# Run the SDK (after building)
npm start
```

## Architecture

### Single-File Design

The entire SDK is contained in `src/index.ts` (~290 lines) with the following structure:

1. **Types namespace** (lines 2-79): All TypeScript interfaces and types
   - Request parameter types: `ImagineParams`, `ButtonPressParams`, `UpscaleParams`, etc.
   - Response types: `ImagineResponse`, `MessageResponse`, `ErrorResponse`
   - Configuration: `ImagineProSDKOptions`

2. **Button enum** (lines 82-107): Defines all available button actions
   - Upscale buttons: U1-U4
   - Variant buttons: V1-V4
   - Special actions: REROLL, ZOOM_OUT_2X, VARY_REGION, etc.

3. **ImagineProSDK class** (lines 112-288): Main SDK class
   - Constructor initializes API key, base URL, timeouts
   - Public methods: `imagine()`, `pressButton()`, `upscale()`, `variant()`, `reroll()`, `inpainting()`
   - Polling method: `fetchMessage()` polls until status is DONE or FAIL
   - Private HTTP helpers: `getRequest()`, `postRequest()`

### Core Patterns

**Polling Pattern**: The `fetchMessage()` method (lines 153-173) implements a polling loop:
- Calls `fetchMessageOnce()` repeatedly at configurable intervals
- Continues until status is DONE or FAIL
- Throws timeout error if exceeded
- Default interval: 2000ms, default timeout: 30 minutes

**Button Action Helpers**: Methods like `upscale()` and `variant()` are convenience wrappers:
- They construct the appropriate button identifier (e.g., "U1", "V3")
- Call `pressButton()` with the constructed button name
- Extract and forward base parameters (ref, webhookOverride, timeout, disableCdn)

**API Communication**:
- All requests include `Authorization: Bearer ${apiKey}` header
- Error responses are parsed and thrown with descriptive messages
- Uses native `fetch()` API (requires Node.js >= 18.x)

## Testing

Tests are in `src/__tests__/ImagineProSDK.test.ts` using Jest with ts-jest preset.

**Test setup:**
- Creates mock SDK instance with test API key
- Tests initialization, timeout behavior, and API calls
- Uses Jest's `mockImplementationOnce` for fetch mocking

**Run a single test file:**
```bash
npx jest src/__tests__/ImagineProSDK.test.ts
```

**Run specific test:**
```bash
npx jest -t "should initialize with default values"
```

## API Endpoints

The SDK currently interacts with these endpoints (all relative to `baseUrl`, default: https://api.imaginepro.ai):

**Currently Implemented:**
- `POST /api/v1/nova/imagine` - Generate new image from prompt
- `POST /api/v1/nova/button` - Press a button (upscale, variant, etc.)
- `GET /api/v1/message/fetch/{messageId}` - Fetch message status

**Available but Not Yet Implemented in SDK:**

### Gemini API
- `POST /api/v1/gemini/imagine` - Generate image using Gemini/Nanobanana model
  - Request body includes `contents` array with image URLs and text prompts
  - Supports `model` parameter (default: "gemini-2.5-flash-image-preview", alternative: "flux-1.1-pro")
  - Example: `{ "contents": [{ "type": "image", "url": "..." }, { "type": "text", "text": "make her dress in red" }], "model": "gemini-2.5-flash-image-preview" }`
  - Returns standard response: `{ "success": true, "messageId": "...", "createdAt": "..." }`
  - Use same `fetchMessage()` polling approach or `webhookOverride` for results

### Video API (Midjourney Video Generation)
- `POST /api/v1/video/mj/generate` - Generate video from start/end frame images
  - Request body: `{ "prompt": "string", "startFrameUrl": "...", "endFrameUrl": "...", "ref": "...", "webhookOverride": "...", "timeout": 900 }`
  - Returns: `{ "success": true, "messageId": "...", "createdAt": "..." }`

- `GET /api/v1/video/mj/fetch/{messageId}` - Get video generation progress (similar to image fetch)

- `POST /api/v1/video/mj/extend` - Extend a generated video
  - Request body: `{ "messageId": "...", "index": 0, "animateMode": "...", "ref": "...", "webhookOverride": "...", "timeout": 900 }`
  - Choose one result from previous video generation response
  - Returns same format as generate endpoint

## Important Implementation Details

**BaseParams extraction** (line 233): The `extractBaseParams()` method ensures webhook and timeout parameters are properly forwarded through convenience methods.

**Status polling**: Message status values are: `PROCESSING`, `QUEUED`, `DONE`, `FAIL`. Only DONE and FAIL are terminal states.

**Button naming**: Button identifiers must match exactly (case-sensitive). Use the Button enum constants to avoid typos.

**Error handling**: Both GET and POST requests catch errors, log them to console, and re-throw. API errors include statusCode and detailed error messages.

## Node.js Version Requirement

The package requires Node.js >= 18.x because it uses the native `fetch()` API (lines 243, 268). For older Node versions, a fetch polyfill would be needed.

## Future API Implementation Considerations

When implementing the Gemini and Video APIs, follow these patterns:

**Gemini API Implementation:**
- Add `GeminiImagineParams` type with `contents` array (supporting both image and text content types) and optional `model` parameter
- Create `geminiImagine()` method that calls `postRequest('/api/v1/gemini/imagine', params)`
- Response format is identical to standard `imagine()`, so existing `fetchMessage()` polling works

**Video API Implementation:**
- Add `VideoGenerateParams` type with `prompt`, `startFrameUrl`, `endFrameUrl` plus standard BaseParams
- Add `VideoExtendParams` type with `messageId`, `index`, `animateMode` plus standard BaseParams
- Create `generateVideo()` and `extendVideo()` methods following the same pattern as `imagine()`
- Video progress uses same polling mechanism as images via `fetchMessage()`
- Consider adding a dedicated `fetchVideoMessage()` if video responses have different structure

**Implementation Notes:**
- All new APIs follow the same response pattern: `{ success, messageId, createdAt }`
- All support the same BaseParams: `ref`, `webhookOverride`, `timeout`, `disableCdn`
- Reuse existing `extractBaseParams()` helper
- Video timeout default should be higher (900s vs 300s) due to longer processing times
