import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {

  try {
    const { audioData, label } = event.data;

    let result;
    let output;

    result = await pipeline('zero-shot-audio-classification', 'Xenova/clap-htsat-unfused');
    output = await result(audioData, label);

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
