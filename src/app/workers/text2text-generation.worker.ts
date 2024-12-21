import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { text } = event.data;
  let result;
  let output;

  try {
    result = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
    output = await result(text, {max_new_tokens: 100} as any);

    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};
