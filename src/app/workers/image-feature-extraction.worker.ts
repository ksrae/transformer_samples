import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  // Receive ArrayBuffer and convert back to object
  const buffer = event.data;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const string = decoder.decode(new Uint8Array(buffer));

  let result;
  let output;
  let response;
  let responseString;
  let responseBuffer;

  const { value } = JSON.parse(string);

  try {
    result = await pipeline('image-feature-extraction', 'Xenova/vit-base-patch16-224-in21k', {
      dtype: 'q8',
      device: 'wasm'
    });
    // await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
    output = await result(value);

    // Convert response to ArrayBuffer for transfer
    response = {
      type: 'SUCCESS',
      output
    };
  } catch (error) {
    response = {
      type: 'ERROR',
      error: (error as any).message
    };
  }

  responseString = JSON.stringify(response);
  responseBuffer = encoder.encode(responseString).buffer;
  ctx.postMessage(responseBuffer, [responseBuffer]);
};
