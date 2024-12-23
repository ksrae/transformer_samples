import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  try {
    const { audioData, modelType } = event.data;

    let result;
    let output;

    if (modelType === 'gender') {
      // Load the pipeline
      result = await pipeline('audio-classification', 'Xenova/wav2vec2-large-xlsr-53-gender-recognition-librispeech', {
        dtype: 'q8',
        device: 'wasm'
      });
      // Process the audio data
      output = await result(audioData);
    } else if (modelType === 'star') {
      result = await pipeline('audio-classification', 'Xenova/ast-finetuned-audioset-10-10-0.4593', {
        dtype: 'q8',
        device: 'wasm'
      });
      output = await result(audioData, { top_k: 5 });
    }

    const response = {
      type: 'SUCCESS',
      output: Array.isArray(output) ? output : [output],
    };

    ctx.postMessage(response); // Sending structured data; no transfer needed here
  } catch (error) {
    ctx.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
};
