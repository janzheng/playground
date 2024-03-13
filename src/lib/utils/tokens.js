
import { getEncoding } from 'js-tiktoken'
let tokenizer = getEncoding('cl100k_base')

export function getTokenStrLen(input, encoding = 'cl100k_base') {
  if (encoding != 'cl100k_base')
    tokenizer = getEncoding(encoding)
  return new Uint32Array(tokenizer.encode(input)).length
}

export function getTokenLen(input) {
  if (typeof input === 'string') {
    return getTokenStrLen(input);
  } else if (Array.isArray(input)) {
    // console.log('getTokenLen input:', {input});
    let tokens = input.map(message => message.content && message.content.length > 0 && getTokenStrLen(message.content));
    let total = tokens.reduce((a, b) => a + b, 0);
    return {
      messages: input.length,
      tokens: tokens,
      total: total
    };
  }

}