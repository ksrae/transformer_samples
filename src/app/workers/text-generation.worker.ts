import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { text } = event.data;
  let result;
  let output;

  try {
    result = await await pipeline('text-generation', 'eachadea/vicuna-7b-1.1');
    // await pipeline('text-generation', 'Xenova/codegen-350M-mono');
    output = await result(text, {
      temperature: 2,
      max_new_tokens: 10,
      repetition_penalty: 1.5,
      no_repeat_ngram_size: 2,
      num_beams: 2,
      num_return_sequences: 2,
    });


    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};
