# API do InvesteAI

A API usa Java 21, Spring Boot e PostgreSQL 18. O Flyway aplica as migrações automaticamente quando a API inicia. Para o fluxo geral do projeto, consulte o [README principal](../README.md).

## Inicialização recomendada: Docker Compose

Pré-requisitos: Docker com Compose v2 e as portas `8080` e `5432` livres.

1. Copie `api/.env.example` para `api/.env` (`Copy-Item api/.env.example api/.env` no PowerShell ou `cp api/.env.example api/.env` no macOS/Linux). Altere `POSTGRES_PASSWORD` e defina `JWT_SECRET` como um valor aleatório de pelo menos 32 bytes. `BRAPI_API_KEY` é opcional.
2. Abra um terminal na raiz do repositório e inicie o banco e a API:

   ```sh
   docker compose up --build
   ```
   Caso deseje manter os serviços em segundo plano, use `docker compose up --build -d`. O Compose cria um volume `investeai_data` para persistir o banco entre inicializações.

   O Compose carrega `api/.env` automaticamente para os dois serviços e os mantém em execução em segundo plano. Acompanhe a inicialização verificando o endereço de saúde no próximo passo.
3. Confirme que `http://localhost:8080/actuator/health` retorna `UP`. A documentação interativa fica em [Swagger UI](http://localhost:8080/swagger-ui.html).

Para parar os serviços e manter os dados, execute `docker compose down` na raiz. O volume `investeai_data` persiste o banco entre inicializações.

## Executar a API pelo Maven

Use este fluxo para desenvolvimento Java. Inicie primeiro o banco pela raiz:

```sh
docker compose up -d db
```

Instale o JDK 21. Abra um terminal na pasta `api/` e inicie a API:

```sh
./mvnw spring-boot:run
```

No PowerShell, use `.\mvnw.cmd spring-boot:run`. Execute o comando dentro de `api/`: o Spring lê `.env` nessa pasta automaticamente. O banco deve estar ativo e a API deve responder em `http://localhost:8080/actuator/health`.

## Configuração

O arquivo `api/.env.example` lista as opções. Mantenha `api/.env` privado e fora do Git. `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD` configuram o banco; `JWT_SECRET` é obrigatório para iniciar a API. `BRAPI_API_KEY` habilita a integração de cotações e pode ficar vazia. Os demais valores têm padrões adequados para desenvolvimento local.

Para testar a API, execute `./mvnw test` em `api/` (no PowerShell: `.\mvnw.cmd test`). A suíte de integração PostgreSQL requer um banco descartável configurado por `POSTGRES_TEST_URL`, `POSTGRES_TEST_USER` e `POSTGRES_TEST_PASSWORD`.

## Problemas comuns

- **API não inicia:** confira o estado dos contêineres com `docker compose ps`, as portas e os valores em `api/.env`. Se já existir um volume de banco, a senha configurada precisa corresponder à senha original do volume.
- **Erro de CORS no navegador:** inclua a origem completa (protocolo, host e porta) em `CORS_ORIGINS` no `api/.env` e recrie a API com `docker compose up -d api`.
- **Cotações indisponíveis:** confira `BRAPI_API_KEY` e a cobertura do seu plano BRAPI.

Veja a [documentação da API](API_DOCUMENTATION_PT.md) para rotas e exemplos de requisição.
