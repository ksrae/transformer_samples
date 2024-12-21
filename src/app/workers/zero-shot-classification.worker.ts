import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { text, labels } = event.data;
  let result;
  let output;

  try {
    result = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
    // await pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-xsmall');

    output = await result(text, labels);

    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};
