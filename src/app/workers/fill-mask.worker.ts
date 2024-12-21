import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { text, modelType } = event.data;
  let result;
  let output;

  try {
    result = await pipeline('fill-mask', 'Xenova/bert-base-cased');
    output = await result(text);

    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};
