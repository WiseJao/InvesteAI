# Aplicativo do InvesteAI

O app usa React Native com Expo e roda em navegador, Android e iOS. Inicie primeiro a API seguindo o [guia da API](../api/README.md) e confirme que `http://localhost:8080/actuator/health` retorna `UP`.

## Preparar

Pré-requisitos: Node.js 22.13+ ou 24.3+ e npm. Na raiz do repositório, copie `app/.env.example` para `app/.env` e instale as dependências:

```powershell
cd app
Copy-Item .env.example .env
npm ci
```

No macOS ou Linux, use `cp .env.example .env` em vez de `Copy-Item`. Por padrão, `EXPO_PUBLIC_API_URL=http://localhost:8080` funciona no navegador do computador e no simulador iOS.

Escolha o endereço da API conforme o dispositivo:

| Dispositivo | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Navegador no computador ou simulador iOS no Mac | `http://localhost:8080` |
| Emulador Android padrão | `http://10.0.2.2:8080` |
| Celular na mesma rede Wi-Fi | `http://IP_DO_COMPUTADOR:8080` |

Para um celular físico, substitua `IP_DO_COMPUTADOR` pelo IPv4 do computador (no Windows, execute `ipconfig`). Abra o endereço com `/actuator/health` no navegador do celular para confirmar o acesso. Reinicie o Expo após alterar `.env`.

## Iniciar

Abra um terminal na pasta `app/`, execute o comando correspondente ao destino e mantenha esse terminal aberto enquanto usa o aplicativo:

| Destino | Comando |
| --- | --- |
| Navegador | `npm run web` |
| Celular com Expo Go | `npm start` e leia o QR code |
| Emulador Android aberto | `npm run android` |
| Simulador iOS aberto | `npm run ios` |

O simulador iOS requer macOS e Xcode. Se o celular não conectar ao servidor de desenvolvimento, tente `npm start -- --tunnel`; a API ainda precisa estar acessível pelo endereço configurado. No navegador, se houver erro de CORS, ajuste `CORS_ORIGINS` em `api/.env` conforme o [guia da API](../api/README.md).

Senhas e chaves privadas pertencem a `api/.env`, nunca a `app/.env`: variáveis `EXPO_PUBLIC_*` são incluídas no bundle do aplicativo.
