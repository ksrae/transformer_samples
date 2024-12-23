import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const buffer = event.data;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const string = decoder.decode(new Uint8Array(buffer));

  let result;
  let output;
  let response;
  let responseString;
  let responseBuffer;

  const { type, imageUrl } = JSON.parse(string);

  try {
    if(type === 'caption') {
      result = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning', {
        dtype: 'q8',
        device: 'wasm'
      });
      output = await result(imageUrl);
    } else if(type === 'ocr') {
      result = await pipeline('image-to-text', 'Xenova/trocr-small-handwritten', {
        dtype: 'q8',
        device: 'wasm'
      });
      output = await result(imageUrl);
    }

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
