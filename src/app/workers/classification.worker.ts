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

  const { text, modelType } = JSON.parse(string);

  try {
    switch (modelType) {
      case 'positive':
        result = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        output = await result(text);
        break;
      case 'star':
        result = await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');
        output = await result(text, { top_k: 5 });
        break;
      case 'feel':
        result = await pipeline('text-classification', 'Xenova/toxic-bert');
        output = await result(text, { top_k: undefined });
        break;
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
