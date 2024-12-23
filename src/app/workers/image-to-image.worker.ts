import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  // Receive ArrayBuffer and convert back to object
  const buffer = event.data;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const string = decoder.decode(new Uint8Array(buffer));

  let result;
  let output;
  let response;
  let responseBuffer;

  const { value } = JSON.parse(string);

  try {
    result = await pipeline('image-to-image', 'Xenova/swin2SR-classical-sr-x2-64');
    output = await result(value) as any;

    // RawImage 객체를 직렬화 가능한 형태로 변환
    const serializedOutput = {
      type: 'SUCCESS',
      output: {
        data: Array.from(output.data), // Uint8Array를 일반 배열로 변환
        width: output.width,
        height: output.height,
        channels: output.channels
      }
    };

    responseBuffer = encoder.encode(JSON.stringify(serializedOutput)).buffer;
  } catch (error) {
    response = {
      type: 'ERROR',
      error: (error as any).message
    };
    responseBuffer = encoder.encode(JSON.stringify(response)).buffer;
  }

  ctx.postMessage(responseBuffer, [responseBuffer]);
};
