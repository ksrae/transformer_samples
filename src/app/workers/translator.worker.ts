import { pipeline } from '@huggingface/transformers';

const ctx: Worker = self as any;

ctx.onmessage = async (event) => {
  const { text, sourceLang, targetLang } = event.data;
  let result;
  let output;

  try {
    result = await pipeline('translation', 'Xenova/m2m100_418M');
    // await pipeline('translation', 'Xenova/nllb-200-distilled-600M');
    // await pipeline('translation', 'Xenova/mbart-large-50-many-to-many-mmt');
    output = await result(text, {
      src_lang: sourceLang,
      tgt_lang: targetLang,
    } as any);

    ctx.postMessage({ type: 'SUCCESS', output });
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: (error as any).message });
  }
};
