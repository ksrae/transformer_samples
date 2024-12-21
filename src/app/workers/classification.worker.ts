import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { text, modelType } = event.data;
  let result;
  let output;

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

    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};
