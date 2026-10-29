const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const babel = require('@babel/core');

const root = path.resolve(__dirname, '../..');
function load(file, dependencies = {}, globals = {}, appendix = '') {
  const source = fs.readFileSync(path.join(root, file), 'utf8') + appendix;
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  return evaluate(code, dependencies, globals);
}
function evaluate(code, dependencies, globals) {
  const exports = {};
  vm.runInNewContext(code, {
    exports, Error, TypeError, Blob, Response, Request, Headers, TextEncoder, TextDecoder,
    ArrayBuffer, Uint8Array, ReadableStream, URLSearchParams, AbortController,
    setTimeout, clearTimeout, process: { env: {} }, console,
    require: (name) => {
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
    ...globals,
  });
  return exports;
}

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9n8AAAAASUVORK5CYII=', 'base64');
const result = {
  classes: [{ dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '10:30:00', subjectName: '자료구조' }],
  freeTimeSlots: [{ dayOfWeek: 'MONDAY', startTime: '10:30:00', endTime: '12:00:00' }],
};

function createHarness(options = {}) {
  const transport = [], conversions = [], requests = [];
  const files = {
    'file:///timetable.png': { type: 'image/png', data: png },
    'file:///timetable.jpg': { type: 'image/jpeg', data: Buffer.from('jpeg fixture') },
    'file:///timetable.heic': { type: 'image/heic', data: Buffer.from('heic fixture') },
    'file:///converted.jpg': { type: 'image/jpeg', data: Buffer.from('converted jpeg bytes') },
    'file:///empty.png': { type: 'image/png', data: Buffer.alloc(0) },
    'file:///large.png': { type: 'image/png', data: png, size: 11 * 1024 * 1024 },
  };
  class NativeFile {
    constructor(uri) {
      const source = files[uri];
      this.uri = uri;
      this.name = uri.split('/').at(-1);
      this.type = source?.type ?? '';
      this.exists = Boolean(source);
      this.size = source ? source.size ?? source.data.length : 0;
      this.bytes = async () => source.data;
    }
  }
  // Exercise the installed React Native FormData and Expo multipart encoder, not a stub encoder.
  const rnCode = babel.transformSync(fs.readFileSync(path.join(root, 'node_modules/react-native/Libraries/Network/FormData.js'), 'utf8'), {
    babelrc: false, configFile: false,
    plugins: [require.resolve('@babel/plugin-transform-flow-strip-types'), require.resolve('@babel/plugin-transform-modules-commonjs')],
  }).code;
  const FormData = evaluate(rnCode, {}, {}).default;
  const globals = { FormData };
  load('node_modules/expo/src/winter/FormData.ts', {}, globals).installFormDataPatch(FormData);
  const blobUtils = { blobToArrayBufferAsync: (blob) => blob.arrayBuffer() };
  const converter = load('node_modules/expo/src/winter/fetch/convertFormData.ts', {
    '../../utils/blobUtils': blobUtils,
  }, globals);
  const normalizer = load('node_modules/expo/src/winter/fetch/RequestUtils.ts', {
    '../../utils/blobUtils': blobUtils, './convertFormData': converter,
  }, globals);
  const fetch = async (url, init = {}) => {
    if (url.startsWith('blob:')) {
      return options.unreadableAsset
        ? new Response('missing', { status: 404 })
        : new Response(new Blob([png], { type: 'image/png' }));
    }
    requests.push({ url, ...init });
    if (options.networkError) throw options.networkError;
    if (init.body instanceof FormData) {
      const encoded = await normalizer.normalizeBodyInitAsync(init.body);
      transport.push({ body: Buffer.from(encoded.body), headers: encoded.overriddenHeaders });
    }
    if (options.httpStatus) return new Response(JSON.stringify({ code: 'GRID_NOT_FOUND', message: '격자선을 찾지 못했어요.' }), { status: options.httpStatus });
    if (url.endsWith('/users/setup')) {
      if (options.saveError) return new Response('save failed', { status: 500 });
      return new Response(null, { status: 200 });
    }
    if (url.endsWith('/users/me/setup')) return new Response(JSON.stringify(options.savedSetup ?? result));
    return new Response(JSON.stringify(options.ocrResult ?? result));
  };
  const client = load('src/services/common/client.ts', {
    '@/services/common/auth-storage': { getAccessToken: async () => 'test-token', removeAccessToken: async () => {} },
  }, { ...globals, fetch });
  const errors = load('src/services/exploration/schedule-analysis-errors.ts', {
    '@/services/common/client': client,
  }, globals);
  const upload = load('src/services/exploration/timetable-image-upload.ts', {
    'react-native': { Platform: { OS: options.platform ?? 'ios' } },
    'expo-file-system': { File: NativeFile },
    'expo-image-manipulator': {
      SaveFormat: { JPEG: 'jpeg' },
      ImageManipulator: { manipulate: (uri) => {
        conversions.push(['manipulate', uri]);
        return {
          release: () => conversions.push(['context released']),
          renderAsync: async () => ({
            saveAsync: async (saveOptions) => {
              conversions.push(['save', saveOptions]);
              return { uri: 'file:///converted.jpg' };
            },
            release: () => conversions.push(['image released']),
          }),
        };
      } },
    },
    './schedule-analysis-errors': errors,
  }, { ...globals, fetch });
  const setup = load('src/services/common/user-setup.ts', { './client': client }, globals);
  const api = load('src/services/exploration/schedule-analysis-api.ts', {
    './schedule-analysis-errors': errors,
    './timetable-image-upload': upload,
    '@/services/common/user-setup': setup,
  }, globals);
  return { api, errors, upload, converter, client, FormData, NativeFile, transport, conversions, requests, result };
}
module.exports = { load, createHarness };
