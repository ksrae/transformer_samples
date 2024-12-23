import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  try {
    const { audioData, modelType } = event.data;

    let result;
    let output;

    // Transcribe English.
    result = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
      dtype: 'q8',
      device: 'wasm'
    });
    // const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav';
    output = await result(audioData);
    // Transcribe English w/ timestamps.
    // const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav';
    // output = await result(audioData, { return_timestamps: true });
    // Transcribe English w/ word-level timestamps.
    // const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav';
    // output = await result(audioData, { return_timestamps: 'word' });

    //Transcribe French.
    // result = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
    // const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/french-audio.mp3';
    // output = await result(audioData, { language: 'french', task: 'transcribe' });

    // Translate French to English.
    // result = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
    // const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/french-audio.mp3';
    // output = await result(audioData, { language: 'french', task: 'translate' });


    // Transcribe/translate audio longer than 30 seconds.
    // result = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
    // const url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/ted_60.wav';
    // output = await result(audioData, { chunk_length_s: 30, stride_length_s: 5 });

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
