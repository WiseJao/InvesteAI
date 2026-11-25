const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadService(platform = 'web') {
    function load(file, imports = {}) {
        const filename = path.join(__dirname, '../source', file);
        const source = fs.readFileSync(filename, 'utf8');
        const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
        const module = { exports: {} };
        new Function('require', 'module', 'exports', compiled)(name => {
            if (!(name in imports)) throw new Error('Import inesperado: ' + name);
            return imports[name];
        }, module, module.exports);
        return module.exports;
    }
    return load('services/api.ts', {
        'react-native': { Platform: { OS: platform } },
        'expo-file-system': { File: class NativeFile extends File {
            constructor(uri) {
                assert.equal(uri, 'file:///avatar.jpg');
                super(['imagem'], 'avatar.jpg', { type: 'image/jpeg' });
            }
        } },
        'expo-secure-store': { setItemAsync: async () => {}, deleteItemAsync: async () => {} },
        '../shared/currency': load('shared/currency.ts'),
    });
}

test('avatar web usa multipart autenticado e trata ausência de foto', async (t) => {
    const api = loadService();
    const chamadas = [];
    t.mock.method(global, 'fetch', async (url, options) => {
        chamadas.push({ url, options });
        if (url.endsWith('/auth/login')) return Response.json({ accessToken: 'token', refreshToken: 'refresh' });
        if (url.startsWith('blob:')) return new Response(new Blob(['imagem'], { type: 'image/jpeg' }));
        if (options.method === 'POST') return new Response(null, { status: 204 });
        return new Response(null, { status: 404 });
    });
    await api.login('teste', 'senha');
    await api.uploadAvatar('blob:local');
    const envio = chamadas.at(-1);
    assert.match(envio.url, /\/user\/me\/avatar$/);
    assert.equal(envio.options.method, 'POST');
    assert.equal(envio.options.headers.Authorization, 'Bearer token');
    assert.equal(envio.options.headers['Content-Type'], undefined);
    assert.equal(envio.options.body.get('file').name, 'avatar.jpg');
    assert.equal(await api.getAvatar(), null);
});

test('avatar iOS envia um arquivo em vez de um objeto de URI', async (t) => {
    const api = loadService('ios');
    t.mock.method(global, 'fetch', async (_url, options) => {
        const image = options.body.get('file');
        assert.ok(image instanceof File);
        assert.equal(await image.text(), 'imagem');
        return new Response(null, { status: 204 });
    });
    await api.uploadAvatar('file:///avatar.jpg');
});

test('avatar recebido é convertido em uma URL exibível', async (t) => {
    const api = loadService();
    t.mock.method(global, 'fetch', async () => new Response(new Blob(['image'], { type: 'image/png' })));
    const original = global.FileReader;
    t.after(() => { global.FileReader = original; });
    global.FileReader = class {
        readAsDataURL(blob) {
            assert.equal(blob.type, 'image/png');
            this.result = 'data:image/png;base64,aW1hZ2U=';
            this.onload();
        }
    };
    assert.equal(await api.getAvatar(), 'data:image/png;base64,aW1hZ2U=');
});

test('erros distinguem limite de tentativas de falha ambígua na gravação', async (t) => {
    const api = loadService();
    t.mock.method(global, 'fetch', async () => Response.json({ error: 'Too Many Requests' }, { status: 429 }));
    await assert.rejects(api.login('teste', 'senha'), error => {
        assert.equal(error.status, 429);
        assert.match(api.mensagemDeErro(error), /Muitas tentativas/);
        assert.doesNotMatch(api.mensagemDeErroDeGravacao(error), /antes de reenviar/);
        return true;
    });
    assert.match(api.mensagemDeErroDeGravacao(new TypeError('Failed to fetch')), /antes de reenviar/);
});
