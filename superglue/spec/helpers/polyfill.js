import { AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill'
import { TextEncoder, TextDecoder } from 'util';
import { JSDOM } from 'jsdom'

function setUpDomEnvironment() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'http://localhost/'});
  const { window } = dom;

  global.window = window;
  global.document = window.document;
  global.navigator = {
      userAgent: 'node.js',
  };
  copyProps(window, global);
}

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
      .filter(prop => typeof target[prop] === 'undefined')
      .map(prop => Object.getOwnPropertyDescriptor(src, prop));
  Object.defineProperties(target, props);
}

setUpDomEnvironment();

global.AbortController = AbortController
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
