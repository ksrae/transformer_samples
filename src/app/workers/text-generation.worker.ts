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

  const { text } = JSON.parse(string);

  try {
    // not working
    result = await await pipeline('text-generation', 'eachadea/vicuna-7b-1.1', {
      dtype: 'q8',
      device: 'wasm'
    });
    output = await result(text);

    // not working
    // result = await await pipeline('text-generation', 'eachadea/vicuna-7b-1.1', {
    //   dtype: 'q8',
    //   device: 'wasm'
    // });
    // output = await result(text, {
    //   temperature: 2,
    //   max_new_tokens: 10,
    //   repetition_penalty: 1.5,
    //   no_repeat_ngram_size: 2,
    //   num_beams: 2,
    //   num_return_sequences: 2,
    // });

    // result = await pipeline('text-generation', 'Xenova/codegen-350M-mono');

    // output = await result(text, {
    //   max_new_tokens: 50,
    // });


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
