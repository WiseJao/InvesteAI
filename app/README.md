# Aplicativo do InvesteAI

O aplicativo usa React Native e Expo SDK 58. O mesmo projeto em `app/` roda no Android, iOS e navegador e consome a API REST da pasta `api/`.

## Pré-requisitos

- Node.js compatível com as dependências fixadas pelo projeto. O lockfile aceita Node 22 a partir de 22.13 ou Node 24 a partir de 24.3. Use uma dessas versões LTS com npm.
- API em execução. Termine a instalação no [guia da API](../api/README.md) e confirme que `http://localhost:8080/actuator/health` retorna `UP`.
- Para celular físico, instale uma versão do Expo Go compatível com o SDK 58. Para emulador Android, configure Android Studio e crie um dispositivo virtual. Para simulador iOS, use um Mac com Xcode e um simulador instalado. Consulte as [instruções de ambiente do Expo](https://docs.expo.dev/get-started/set-up-your-environment/) e a [referência do SDK 58](https://docs.expo.dev/versions/v58.0.0/).

## 1. Instalar dependências

Na raiz do repositório:

```bash
node --version
npm --version
cd app
npm ci
```

Execute os scripts npm do Expo a partir desta pasta. O `npm ci` usa o `package-lock.json` e prepara as dependências do projeto.

## 2. Apontar o aplicativo para a API

Copie [`.env.example`](.env.example) para `.env` dentro de `app/`. Use `cp .env.example .env` no macOS e Linux ou `Copy-Item .env.example .env` no PowerShell, a partir dessa pasta. Ao migrar uma instalação antiga, transfira apenas a URL da API e guarde o `.env.local` anterior fora de `app/` para evitar que ele sobrescreva o novo arquivo.

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8080
```

Escolha o endereço conforme o dispositivo:

| Destino | URL quando a API usa a porta 8080 no computador |
| --- | --- |
| Navegador no mesmo computador | `http://localhost:8080` |
| Simulador iOS no Mac que executa a API | `http://localhost:8080` |
| Emulador padrão do Android Studio | `http://10.0.2.2:8080` |
| Celular físico na mesma rede | `http://IP_DO_COMPUTADOR:8080` |
| API publicada em ambiente de teste | URL HTTPS do ambiente |

No Windows, execute `ipconfig` e procure o endereço IPv4 no adaptador Ethernet ou Wi-Fi usado pelo computador. Por exemplo, se o IP do computador for `192.168.1.25`, a URL do celular será `http://192.168.1.25:8080`. A partir do celular, abra essa URL com `/actuator/health` no navegador para conferir a conexão antes de abrir o app.

Reinicie o Expo após trocar a URL. O Expo carrega `EXPO_PUBLIC_API_URL` de `app/.env` e inclui a URL no bundle. Uma URL definida no terminal tem precedência. Se a variável estiver ausente, o padrão é `http://localhost:8080`. Use HTTP ou HTTPS e uma URL sem usuário, senha, consulta ou fragmento.

Mantenha senhas e chaves de serviço em `api/.env`.

## 3. Abrir na plataforma desejada

Escolha um dos fluxos abaixo e mantenha o terminal do Expo aberto durante o uso.

### Navegador

```bash
npm run web
```

Abra o endereço exibido no terminal, normalmente `http://localhost:8081`. Caso o Expo use outra porta e o navegador bloqueie as requisições, inclua a origem exata no `CORS_ORIGINS` da API e recrie o contêiner conforme o guia da API.

### Celular físico

1. Conecte computador e celular à mesma rede local.
2. Em `app/`, rode `npm start`.
3. No Android, leia o QR code com o Expo Go. No iOS, use a câmera ou o fluxo indicado pelo Expo Go.
4. Aguarde o carregamento do bundle e teste o login.

Se o QR code não conectar ao Metro, teste `npm start -- --tunnel`. O túnel cobre o servidor de desenvolvimento do Expo. A API precisa continuar acessível na URL definida em `EXPO_PUBLIC_API_URL`.

### Emulador Android ou simulador iOS

Abra primeiro o dispositivo virtual no Android Studio ou o simulador no macOS. Em seguida, rode o script correspondente na pasta `app/`:

```bash
npm run android
npm run ios
```

O script de iOS depende de macOS e Xcode. No Windows, use Android, navegador ou um iPhone físico com Expo Go compatível.

## 4. Conferir a integração

1. Cadastre uma conta de teste ou faça login em uma conta existente.
2. Abra a Home e consulte o saldo e a barra de uso do orçamento. Troque o mês para conferir o recorte histórico.
3. Registre um gasto fictício e confirme se ele aparece no histórico.
4. Na Carteira, confirme os filtros de renda fixa e renda variável. Para testar a busca de mercado, confira se a API tem acesso à BRAPI.
5. No Perfil, abra **Editar perfil** para conferir a edição da renda e os controles da foto.

Para validar o TypeScript localmente:

```bash
npx tsc --noEmit
```

Para exportar os bundles usando a mesma configuração:

```bash
npm run export -- --platform all
```

## Problemas comuns

- **Carregamento do bundle ou cache antigo:** pare o Expo com `Ctrl+C` e reinicie com `npm start -- --clear`.
- **Falha de conexão no celular:** abra `/actuator/health` no navegador do próprio aparelho. Confira a URL, a rede local e as permissões de rede privada do firewall do computador. Use o IP do computador para um aparelho físico.
- **Erro de CORS na web:** confira o protocolo, host e porta da origem e ajuste `CORS_ORIGINS` na API.
- **Expo Go incompatível:** confira a versão do SDK em `package.json` e use uma versão do cliente que a suporte. Você pode validar os fluxos básicos pelo navegador enquanto configura o ambiente nativo.
