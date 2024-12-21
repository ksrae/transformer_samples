import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { text, modelType } = event.data;
  let result;
  let output;

  try {
    if(modelType === 'gender') {
      result = await pipeline('audio-classification', 'Xenova/wav2vec2-large-xlsr-53-gender-recognition-librispeech');
      const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav';
      output = await result(url);
    } else if(modelType === 'star') {
      result = await pipeline('audio-classification', 'Xenova/ast-finetuned-audioset-10-10-0.4593');
      const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cat_meow.wav';
      output = await result(url, { top_k: 5 });
    }

    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};

