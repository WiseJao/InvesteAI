# API do InvesteAI

A API é um serviço REST em Java 21 com Spring Boot. O PostgreSQL 18 armazena os dados e o Flyway aplica as migrações ao iniciar. O [README principal](../README.md) descreve o projeto. O [modelo de dados](../docs/DADOS.pdf) cobre as migrações até a V8. Em uma atualização de versão, inicie a API e conclua a V8 antes de distribuir o app. A migração converte posições `LEGACY` em `VARIABLE_INCOME` e preserva os vínculos.

## Pré-requisitos

- Git para clonar o repositório.
- Docker com Docker Compose v2 para a execução recomendada. No Windows e macOS, abra o Docker Desktop antes de executar os comandos.
- Portas TCP `8080` (API) e `5432` (PostgreSQL) livres. Para iniciar a API sem contêiner, instale também um JDK 21. O Maven Wrapper está incluído em `api/`.

Confirme a instalação:

```bash
docker --version
docker compose version
docker info
```

## 1. Criar o arquivo de configuração

Na raiz do repositório, ao lado de `compose.yaml`, crie um arquivo chamado `.env` com os seguintes campos:

```dotenv
POSTGRES_DB=investeai
POSTGRES_USER=investeai
POSTGRES_PASSWORD=substitua-por-uma-senha-local
JWT_SECRET=substitua-pelo-segredo-gerado
BRAPI_API_KEY=
```

- Troque a senha de exemplo. Use uma senha simples de inserir em configuração local, sem espaços ou quebras de linha.
- Gere um segredo JWT aleatório com pelo menos 32 bytes. Use o resultado de `openssl rand -hex 32` no macOS ou Linux. No PowerShell 7, use `[Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`.
- Preencha `BRAPI_API_KEY` com sua chave do [painel da BRAPI](https://brapi.dev/) para usar a cobertura de mercado disponível no seu plano. A API inicializa com o campo vazio. Consultas de mercado sem uma chave válida podem retornar dados limitados ou indisponíveis. Guarde a chave apenas na API.
- Mantenha o arquivo `.env` local. A configuração `EXPO_PUBLIC_API_URL` pertence ao aplicativo e usa somente a URL da API.

O Compose também aceita estas opções no mesmo arquivo:

| Variável | Padrão | Uso |
| --- | --- | --- |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | `900000` | Duração do token de acesso em milissegundos |
| `JWT_REFRESH_TOKEN_EXPIRATION_MS` | `604800000` | Duração do token de renovação em milissegundos |
| `CORS_ORIGINS` | `http://localhost:8081,http://localhost:19006,http://localhost:3000,http://localhost:5173` | Origens do navegador autorizadas, separadas por vírgula |
| `RATE_LIMIT_RPM` | `60` | Cota geral por IP e por minuto |
| `RATE_LIMIT_AUTH_RPM` | `10` | Cota de autenticação e credenciais por IP e por minuto |

## 2. Iniciar a API e o banco com Docker

Na **raiz** do repositório, rode:

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
docker compose logs -f api
```

Na primeira execução, o Compose baixa as imagens, compila a API a partir de `api/Dockerfile`, espera o PostgreSQL ficar saudável e inicia o Spring Boot. Aguarde a mensagem de inicialização do Spring. Use `Ctrl+C` para sair dos logs. Os contêineres continuam em execução.

Em outro terminal, verifique:

```bash
curl http://localhost:8080/actuator/health
```

No PowerShell:

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
```

Espere o status `UP`. Depois, abra o [Swagger UI](http://localhost:8080/swagger-ui.html) ou consulte o [OpenAPI em JSON](http://localhost:8080/v3/api-docs). Para exercitar rotas privadas, cadastre uma conta de teste, faça login e use o `accessToken` no cabeçalho `Authorization: Bearer <token>`.

Para parar a API e o banco e conservar os dados:

```bash
docker compose down
```

O volume `investeai_data` guarda os dados entre execuções. A remoção do volume apaga as informações armazenadas.

## 3. Alternativa com a API rodando pelo Maven Wrapper

Use essa opção para depurar o Java no terminal ou na IDE. Na raiz, suba somente o banco:

```bash
docker compose up -d db
docker compose ps db
```

O Spring executado diretamente em `api/` usa `api/.env` ou variáveis de ambiente do processo. Crie `api/.env` para este modo. Preencha a senha conforme o arquivo da raiz e gere um segredo para o ambiente local:

```dotenv
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/investeai
SPRING_DATASOURCE_USERNAME=investeai
SPRING_DATASOURCE_PASSWORD=mesma-senha-configurada-no-postgres
JWT_SECRET=substitua-pelo-segredo-gerado
BRAPI_API_KEY=
```

Caso tenha escolhido outro banco, porta ou usuário, ajuste esses campos. Configure o JDK 21 no terminal e confirme com `java -version`. Rode os comandos a partir de `api/`:

```bash
cd api
./mvnw spring-boot:run
```

No PowerShell:

```powershell
cd api
.\mvnw.cmd spring-boot:run
```

Confirme novamente `/actuator/health`. Para depurar na IDE, importe `api/pom.xml`, selecione JDK 21 e use `api/` como diretório de trabalho.

## Testes e diagnóstico

- A partir de `api/`, execute `./mvnw test` ou `.\mvnw.cmd test` no PowerShell. Para incluir a suíte PostgreSQL, defina `POSTGRES_TEST_URL`, `POSTGRES_TEST_USER` e `POSTGRES_TEST_PASSWORD` com os dados de um banco PostgreSQL 18 descartável. A URL tem o formato `jdbc:postgresql://localhost:5432/nome_do_banco`.
- Se a API falhar ao iniciar, consulte `docker compose logs api db` na raiz. Cheque a porta, a senha do volume existente, a disponibilidade do banco e o comprimento de `JWT_SECRET`.
- Se o navegador acusar erro de CORS, inclua em `CORS_ORIGINS` a origem exata que aparece no endereço do navegador, com protocolo e porta, e recrie a API com `docker compose up -d api`.
- Se só as cotações falharem, confira `BRAPI_API_KEY` e a cobertura dos símbolos. Parâmetros do app e exemplos de requisição estão na [documentação da API](../API_DOCUMENTATION_PT.md).
