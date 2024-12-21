import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { question, context, modelType } = event.data;
  let result;
  let output;

  try {
    result = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');
    output = await result(question, context);

    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};
