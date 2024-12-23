import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const buffer = event.data;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const string = decoder.decode(new Uint8Array(buffer));

  let responseBuffer;

  const { value } = JSON.parse(string);

  try {
    const depthEstimation = await pipeline('depth-estimation', 'Xenova/dpt-hybrid-midas', {
      dtype: 'q8',
      device: 'wasm'
    });
    const output = await depthEstimation(value) as any;

    // 직렬화 가능한 형태로 변환
    const serializedOutput = {
      type: 'SUCCESS',
      output: {
        predicted_depth: {
          data: Array.from(output.predicted_depth.data), // Float32Array -> Array
          dims: output.predicted_depth.dims,
        },
        depth: {
          data: Array.from(output.depth.data), // Uint8Array -> Array
          width: output.depth.width,
          height: output.depth.height,
          channels: output.depth.channels,
        },
      },
    };

    responseBuffer = encoder.encode(JSON.stringify(serializedOutput)).buffer;
  } catch (error) {
    const response = {
      type: 'ERROR',
      error: (error as any).message,
    };
    responseBuffer = encoder.encode(JSON.stringify(response)).buffer;
  }

  ctx.postMessage(responseBuffer, [responseBuffer]);
};

///////////////////////////////
///////////////////////////////
// 메모리 초과로 실행안됨
///////////////////////////////
///////////////////////////////
// import { pipeline } from '@huggingface/transformers';
// import * as THREE from 'three';

// const ctx: Worker = self as any;

// ctx.onmessage = async (event) => {
//   const buffer = event.data;
//   const decoder = new TextDecoder();
//   const encoder = new TextEncoder();
//   const string = decoder.decode(new Uint8Array(buffer));

//   let responseBuffer;
//   const { value } = JSON.parse(string);

//   try {
//     // Depth estimation pipeline 실행
//     const depthEstimation = await pipeline('depth-estimation', 'Xenova/dpt-hybrid-midas');
//     const output = await depthEstimation(value) as any;

//     // 3D geometry 데이터 생성
//     const geometryData = generate3DGeometry(
//       output.predicted_depth.data,
//       output.predicted_depth.dims
//     );

//     // 직렬화된 결과 생성
//     const serializedOutput = {
//       type: 'SUCCESS',
//       output: {
//         predicted_depth: {
//           dims: output.predicted_depth.dims,
//           geometry: geometryData,
//         },
//         depth: {
//           data: Array.from(output.depth.data),
//           width: output.depth.width,
//           height: output.depth.height,
//           channels: output.depth.channels,
//         },
//       },
//     };

//     responseBuffer = encoder.encode(JSON.stringify(serializedOutput)).buffer;
//   } catch (error) {
//     const response = {
//       type: 'ERROR',
//       error: (error as any).message,
//     };
//     responseBuffer = encoder.encode(JSON.stringify(response)).buffer;
//   }

//   ctx.postMessage(responseBuffer, [responseBuffer]);
// };

// function generate3DGeometry(data: number[], dims: number[]) {
//   const [width, height] = dims;
//   const depthData = Array.from(data);

//   // Z 값 정규화: 최솟값과 최댓값 계산
//   const minDepth = Math.min(...depthData);
//   const maxDepth = Math.max(...depthData);
//   const normalizedData = depthData.map((value) => (value - minDepth) / (maxDepth - minDepth)); // 0 ~ 1 범위로 정규화

//   console.log('Original depth data:', depthData.slice(0, 10)); // 첫 10개 값
//   console.log('Min depth:', minDepth, 'Max depth:', maxDepth);
//   console.log('Normalized depth data:', normalizedData.slice(0, 10)); // 첫 10개 값

//   // Create geometry
//   const geometry = new THREE.PlaneGeometry(2, 2, width - 1, height - 1);
//   const vertices = geometry.attributes['position'].array;

//   // Set normalized depth values
//   for (let i = 0; i < normalizedData.length; i++) {
//     vertices[i * 3 + 2] = normalizedData[i]; // Z-axis
//   }

//   return {
//     vertices: Array.from(vertices),
//     indices: Array.from(geometry.index?.array || []),
//     dims: dims,
//   };
// }
