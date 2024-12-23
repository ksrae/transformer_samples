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

  const { value, label } = JSON.parse(string);

  try {
    result = await pipeline('zero-shot-object-detection', 'Xenova/owlvit-base-patch32', {
      dtype: 'q8',
      device: 'wasm'
    });

    output = await result(value, label, {top_k: 4, threshold: 0.05});

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
