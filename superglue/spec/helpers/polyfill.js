import { AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill'
import { TextEncoder, TextDecoder } from 'util';

global.AbortController = AbortController
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
