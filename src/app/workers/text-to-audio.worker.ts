import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const buffer = event.data;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const string = decoder.decode(new Uint8Array(buffer));
  const { text } = JSON.parse(string);

  let response;
  try {
    // Load text-to-speech pipeline
    // do not use dtype here, it may create low quality audio
    const ttsPipeline = await pipeline('text-to-speech', 'Xenova/speecht5_tts', {
      device: 'wasm',
      quantized: false
    } as any);

    // Fetch and convert speaker embeddings to Float32Array
    const speakerEmbeddingsBuffer = await fetch(
      'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin'
    ).then((res) => res.arrayBuffer());
    const speaker_embeddings = new Float32Array(speakerEmbeddingsBuffer);

    // Generate audio
    const audioOutput = await ttsPipeline(text, { speaker_embeddings });

    // Validate output structure
    const { audio, sampling_rate } = audioOutput;
    if (!audio || !sampling_rate) {
      throw new Error('Invalid audio output from TTS pipeline');
    }

    // Convert response to ArrayBuffer for transfer
    response = {
      type: 'SUCCESS',
      output: { audio: Array.from(audio), sampling_rate },
    };
  } catch (error) {
    response = {
      type: 'ERROR',
      error: (error as any).message,
    };
  }

  const responseString = JSON.stringify(response);
  const responseBuffer = encoder.encode(responseString).buffer;

  ctx.postMessage(responseBuffer, [responseBuffer]);
};
