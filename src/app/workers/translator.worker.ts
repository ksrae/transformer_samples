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

  const { text, sourceLang, targetLang } = JSON.parse(string);

  try {
    result = await pipeline('translation', 'Xenova/m2m100_418M');
    // await pipeline('translation', 'Xenova/nllb-200-distilled-600M');
    // await pipeline('translation', 'Xenova/mbart-large-50-many-to-many-mmt');
    output = await result(text, {
      src_lang: sourceLang,
      tgt_lang: targetLang,
    } as any);

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
