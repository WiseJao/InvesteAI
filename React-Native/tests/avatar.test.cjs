const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.join(__dirname, '../source/services/api.ts');
const source = fs.readFileSync(filename, 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const apiModule = new Module(filename, module);
apiModule.filename = filename;
apiModule.paths = module.paths;
apiModule._compile(compiled, filename);
const api = apiModule.exports;

test('avatar requests use authentication, multipart file and handle missing images', async () => {
    api.setAuthTokens({ accessToken: 'token' });
    let request;
    global.fetch = async (url, options) => {
        request = { url, options };
        return new Response(null, { status: 204 });
    };
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    await api.uploadAvatar({ uri: 'local', name: file.name, type: file.type, webFile: file });
    assert.match(request.url, /\/user\/me\/avatar$/);
    assert.equal(request.options.method, 'POST');
    assert.equal(request.options.headers.Authorization, 'Bearer token');
    assert.equal(request.options.headers['Content-Type'], undefined);
    assert.equal(request.options.body.get('file').name, 'avatar.png');

    global.fetch = async (url, options) => {
        request = { url, options };
        return new Response(null, { status: 404 });
    };
    assert.equal(await api.getAvatar(), null);
    assert.equal(request.options.headers.Authorization, 'Bearer token');

    global.fetch = async () => new Response('denied', { status: 403 });
    await assert.rejects(api.getAvatar(), /HTTP 403/);
    await assert.rejects(api.uploadAvatar({ uri: 'local', name: file.name, type: file.type, webFile: file }), /denied/);
    api.clearAuthTokens();
});

test('avatar image bytes are converted to a displayable data URL', async () => {
    global.fetch = async () => new Response(new Blob(['image'], { type: 'image/png' }));
    global.FileReader = class {
        readAsDataURL(blob) {
            assert.equal(blob.type, 'image/png');
            this.result = 'data:image/png;base64,aW1hZ2U=';
            this.onload();
        }
    };
    assert.equal(await api.getAvatar(), 'data:image/png;base64,aW1hZ2U=');
});