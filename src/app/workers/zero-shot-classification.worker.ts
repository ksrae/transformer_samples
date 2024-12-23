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

  const { text, labels } = JSON.parse(string);

  try {
    result = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli', {
      dtype: 'q8',
      device: 'wasm'
    });
    // await pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-xsmall');

    output = await result(text, labels);

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
