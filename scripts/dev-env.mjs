import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = new URL('../', import.meta.url);
const publicApiUrl = 'EXPO_PUBLIC_API_URL';
const postgresKeys = ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD'];
const datasourceKeys = ['SPRING_DATASOURCE_URL', 'SPRING_DATASOURCE_USERNAME', 'SPRING_DATASOURCE_PASSWORD'];
const apiKeys = [
    'JWT_SECRET', 'JWT_ACCESS_TOKEN_EXPIRATION_MS', 'JWT_REFRESH_TOKEN_EXPIRATION_MS',
    'BRAPI_API_KEY', 'CORS_ORIGINS', 'RATE_LIMIT_RPM', 'RATE_LIMIT_AUTH_RPM',
    'PORT', 'MAX_FILE_SIZE', 'MAX_REQUEST_SIZE',
];

function readRootEnv() {
    try {
        return parseEnv(readFileSync(new URL('.env', root), 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        throw new Error('Não foi possível ler o .env da raiz.');
    }
}

function validateApiUrl(value) {
    try {
        const url = new URL(value);
        if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash) {
            return url.href.replace(/\/$/, '');
        }
    } catch {
        // A mensagem abaixo identifica a variável sem imprimir seu valor.
    }
    throw new Error('EXPO_PUBLIC_API_URL deve ser uma URL HTTP ou HTTPS sem credenciais, consulta ou fragmento.');
}

function launch(command, args, cwd, env) {
    const child = spawn(command, args, { cwd, env, stdio: 'inherit' });
    child.once('error', () => {
        console.error('Não foi possível iniciar o comando de desenvolvimento.');
        process.exitCode = 1;
    });
    child.once('exit', (code, signal) => {
        process.exitCode = code ?? (signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1);
    });
}

function main([mode, ...args]) {
    if (mode !== 'expo' && (mode !== 'api' || args.length)) {
        throw new Error('Uso: node scripts/dev-env.mjs expo <comando> [opções] ou node scripts/dev-env.mjs api.');
    }
    const fileEnv = readRootEnv();
    const get = (key) => process.env[key] ?? fileEnv[key];
    const env = { ...process.env };

    if (mode === 'expo') {
        for (const key of [...apiKeys, ...postgresKeys, ...datasourceKeys]) delete env[key];
        env.EXPO_NO_DOTENV = '1';
        env[publicApiUrl] = validateApiUrl(get(publicApiUrl) ?? 'http://localhost:8080');
        const mobile = new URL('mobile/', root);
        const require = createRequire(new URL('package.json', mobile));
        let expo;
        try {
            expo = require.resolve('expo/bin/cli');
        } catch {
            throw new Error('Instale as dependências com npm ci em mobile/ antes de iniciar o Expo.');
        }
        launch(process.execPath, [expo, ...args], fileURLToPath(mobile), env);
        return;
    }

    for (const key of apiKeys) {
        const value = get(key);
        if (value !== undefined) env[key] = value;
    }
    const database = get('POSTGRES_DB') ?? 'investeai';
    env.SPRING_DATASOURCE_URL = get('SPRING_DATASOURCE_URL') ?? 'jdbc:postgresql://localhost:5432/' + database;
    env.SPRING_DATASOURCE_USERNAME = get('SPRING_DATASOURCE_USERNAME') ?? get('POSTGRES_USER') ?? 'investeai';
    env.SPRING_DATASOURCE_PASSWORD = get('SPRING_DATASOURCE_PASSWORD') ?? get('POSTGRES_PASSWORD') ?? 'investeai';
    const cwd = fileURLToPath(new URL('api/', root));

    if (process.platform === 'win32') {
        launch(process.env.ComSpec ?? 'cmd.exe', ['/d', '/c', 'mvnw.cmd', 'spring-boot:run'], cwd, env);
    } else {
        launch('./mvnw', ['spring-boot:run'], cwd, env);
    }
}

try {
    main(process.argv.slice(2));
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
