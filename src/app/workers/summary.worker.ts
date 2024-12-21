import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { text } = event.data;
  let result;
  let output;

  try {
    // Xenova/t5-small
    // Xenova/bart-large-cnn
    result = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
    output = await result(text, {
      max_new_tokens: 100,
    } as any);

    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};
