# Documentação da REST API - InvesteAI

Documentação técnica completa da API para o serviço backend do **InvesteAI**.

---

## Sumário
1. [Visão Geral & Arquitetura](#visão-geral--arquitetura)
2. [Convenções Globais & Cabeçalhos](#convenções-globais--cabeçalhos)
3. [Autenticação & Fluxo de Segurança](#autenticação--fluxo-de-segurança)
4. [Políticas de Rate Limiting](#políticas-de-rate-limiting)
5. [Padrão de Respostas de Erro](#padrão-de-respostas-de-erro)
6. [Referência dos Endpoints](#referência-dos-endpoints)
   - [1. Autenticação & Recuperação de Conta (`/auth`)](#1-autenticação--recuperação-de-conta-auth)
   - [2. Gestão de Usuário & Perfil (`/user`)](#2-gestão-de-usuário--perfil-user)
   - [3. Fluxo de Caixa & Despesas (`/cashflow`)](#3-fluxo-de-caixa--despesas-cashflow)
   - [4. Objetivos Financeiros & Metas (`/goals`)](#4-objetivos-financeiros--metas-goals)
   - [5. Proxy de Dados de Mercado BRAPI (`/investments`)](#5-proxy-de-dados-de-mercado-brapi-investments)
   - [6. Carteira & Custódia de Investimentos (`/portfolio`)](#6-carteira--custódia-de-investimentos-portfolio)
   - [7. Assessoria IA & Perfil de Risco (`/ai`)](#7-assessoria-ia--perfil-de-risco-ai)
7. [Guia de Integração de Clientes](#guia-de-integração-de-clientes)
   - [Exemplos de Fluxo Completo (cURL)](#exemplos-de-fluxo-completo-curl)
   - [Implementação de Cliente em TypeScript / Axios](#implementação-de-cliente-em-typescript--axios)

---

## Visão Geral & Arquitetura

O InvesteAI disponibiliza uma REST API modular e de alto desempenho desenvolvida sobre Spring Boot 3, Java 21 e PostgreSQL. O sistema expõe funcionalidades completas de gestão financeira: cadastro unificado, controle de receitas e despesas, rastreamento de objetivos financeiros, agregação de dados de mercado da BRAPI, custódia de carteira de investimentos e assessoria de risco potencializada por inteligência artificial.

### URLs Base
- **Desenvolvimento Local**: `http://localhost:8080`
- **Porta Padrão**: `8080`

---

## Convenções Globais & Cabeçalhos

- **Formato das Requisições**: Todas as requisições com corpo devem trafegar dados em formato JSON com `Content-Type: application/json; charset=UTF-8`.
- **Formato das Respostas**: Todos os retornos da API são emitidos em `application/json; charset=UTF-8` (exceto operações `204 No Content`).
- **Padrões de Data & Hora**:
  - Datas em formato calendário ISO-8601: `YYYY-MM-DD` (ex: `2026-11-19`).
  - Carimbos de data/hora no padrão UTC ISO-8601: `YYYY-MM-DDTHH:mm:ss.sssZ` (ex: `2026-11-19T06:22:00.000Z`).
- **Precisão Numérica**:
  - Valores monetários são expressos como decimais de alta precisão (`BigDecimal`).
  - Taxas percentuais são expressas em valores numéricos decimais de `0.0` a `100.0`.
- **Identificadores**: Chaves primárias e identificadores de entidades são representados no padrão UUID de 36 caracteres (ex: `3fa85f64-5717-4562-b3fc-2c963f66afa6`).

### Cabeçalho de Segurança
Rotas protegidas exigem o envio do token JWT Bearer no cabeçalho `Authorization`:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## Autenticação & Fluxo de Segurança

O InvesteAI adota autenticação stateless baseada em tokens JWT:
1. **Access Token**: Token de curta duração (padrão: 15 minutos), enviado no cabeçalho `Authorization`.
2. **Refresh Token**: Token de longa duração (padrão: 7 dias), utilizado no endpoint `POST /auth/refresh` para obter novo par de tokens sem necessidade de reinserção de senha.
3. **Cadastro Unificado**: O endpoint `POST /auth/register` persiste os dados de Usuário, Perfil e Respostas do Formulário de Onboarding de maneira atômica em uma única transação no banco de dados.

---

## Políticas de Rate Limiting

O limite por IP é de 60 requisições por minuto para rotas gerais e 10 para rotas de autenticação e alteração de credenciais. Ao exceder a cota, a API responde com HTTP 429.

---

## Padrão de Respostas de Erro

Use o status HTTP para tratar falhas. O corpo depende do endpoint e pode estar vazio.

### Códigos de Status HTTP Frequentes
| Código | Significado | Descrição |
|:---|:---|:---|
| `200 OK` | Sucesso | Requisição processada com êxito e corpo de resposta retornado. |
| `201 Created` | Criado | Recurso criado com sucesso. |
| `204 No Content` | Sem Conteúdo | Operação executada com sucesso sem conteúdo no corpo de resposta. |
| `400 Bad Request` | Requisição Inválida | Falha de validação de dados, campos obrigatórios ausentes ou duplicidade. |
| `401 Unauthorized` | Não Autorizado | Credenciais inválidas, token ausente, malformado ou expirado. |
| `403 Forbidden` | Proibido | O usuário autenticado não possui permissão para o recurso solicitado. |
| `404 Not Found` | Não Encontrado | O recurso solicitado não existe no sistema. |
| `429 Too Many Requests` | Limite Excedido | Limite de taxa de requisições por minuto atingido. |
| `500 Internal Server Error` | Erro no Servidor | Falha interna não tratada na execução do servidor. |

---

## Referência dos Endpoints

### 1. Autenticação & Recuperação de Conta (`/auth`)

#### 1.1 Cadastro Unificado
`POST /auth/register` (Público)

Cria simultaneamente os registros de `User`, `Profile` e `Form` em uma única operação transacional.

- **Corpo da Requisição** (`UnifiedRegisterRequest` / `RegisterRequest`):
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!",
  "cpf": "123.456.789-00",
  "nickname": "Jane",
  "occupation": "Engenheira de Software",
  "salary": 8500.00,
  "salaryDate": "2026-11-05",
  "hearAboutUs": "Instagram",
  "howWantsToUse": "Investimentos e controle de gastos",
  "openFinance": true,
  "currentBanks": "Nubank, Itaú",
  "favoriteColor": "#5856D6"
}
```

- **Regras de Validação de Campos**:
  - `name`: Obrigatório, máximo de 255 caracteres (`@NotBlank`, `@Size(max = 255)`).
  - `email`: Obrigatório, formato de e-mail válido, máx. 255 caracteres (`@NotBlank`, `@Email`, `@Size(max = 255)`).
  - `password`: Obrigatório (`@NotBlank`).
  - `cpf`: Obrigatório (`@NotBlank`), com ou sem máscara.
  - `salary`: Opcional, valor numérico decimal (`BigDecimal`).
  - `salaryDate`: Opcional, data no padrão ISO (`LocalDate`).
  - `openFinance`: Opcional, booleano (padrão: `false`).

- **Resposta (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Respostas de Erro**:
  - `400 Bad Request`: E-mail ou CPF já cadastrados, ou falha de validação dos campos.

---

#### 1.2 Login de Usuário
`POST /auth/login` (Público)

Autentica o usuário por E-mail ou CPF com senha.

- **Corpo da Requisição** (`LoginRequest`):
```json
{
  "identifier": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```

- **Regras de Validação**:
  - `identifier`: Obrigatório (`@NotBlank`), aceita endereço de e-mail ou CPF.
  - `password`: Obrigatório (`@NotBlank`).

- **Resposta (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Respostas de Erro**:
  - `401 Unauthorized`: Credenciais incorretas.

---

#### 1.3 Renovar Token de Acesso (Refresh Token)
`POST /auth/refresh` (Público)

Gera um novo par de tokens a partir de um refresh token válido.

- **Corpo da Requisição** (`RefreshTokenRequest`):
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Resposta (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Respostas de Erro**:
  - `401 Unauthorized`: Refresh token inválido ou expirado.

---

#### 1.4 Logout
`POST /auth/logout` (Público)

O cliente encerra a sessão. Os tokens emitidos continuam válidos até expirar.

- **Corpo da Requisição**: Nenhum (vazio).
- **Resposta (`200 OK`)**:
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

#### 1.5 Recuperação e redefinição de senha

`POST /auth/forgot-password` · `POST /auth/reset-password`

Ambos retornam HTTP 503. A recuperação aguarda um canal verificado de entrega.

---

### 2. Gestão de Usuário & Perfil (`/user`)

#### 2.1 Obter Perfil do Usuário Autenticado
`GET /user/me` (Protegido - Bearer Token)

Retorna os atributos pessoais, profissionais e financeiros do usuário logado.

- **Cabeçalho**: `Authorization: Bearer <token>`
- **Resposta (`200 OK`)**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "profile": {
    "profileId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Jane Doe",
    "nickname": "Jane",
    "occupation": "Engenheira de Software",
    "salary": 8500.00,
    "salaryDate": "2026-11-05",
    "profileImages": null
  },
  "email": "jane.doe@example.com",
  "cpf": "12345678900"
}
```

---

#### 2.2 Alterar senha

`PUT /users/me/password`

Requer token de acesso e corpo JSON com `currentPassword` e `newPassword`. Responde HTTP 204 em caso de sucesso.

---

### 3. Fluxo de Caixa & Despesas (`/cashflow`)

#### 3.1 Listar Transações Financeiras
`GET /cashflow` (Protegido - Bearer Token)

Retorna todas as entradas e saídas financeiras do usuário autenticado, com filtros opcionais por mês, ano e tipo.

- **Parâmetros de Consulta (Query Params)**:
  - `month` (opcional, inteiro): `1` a `12`.
  - `year` (opcional, inteiro): Ano com 4 dígitos (ex: `2026`).
  - `type` (opcional, texto): Filtra por tipo ou direção (`INCOME`, `EXPENSE_FIXED`, `EXPENSE_VARIABLE`, `FIXED`, `VARIABLE`, `IN`, `OUT`).

- **Resposta (`200 OK`)**:
```json
[
  {
    "id": "e3a89042-6e21-4f38-8374-4b5514088921",
    "cashFlowId": "e3a89042-6e21-4f38-8374-4b5514088921",
    "flowDate": "2026-11-05",
    "date": "2026-11-05",
    "amount": 8500.00,
    "value": 8500.00,
    "direction": "IN",
    "description": "Salário Mensal",
    "name": "Salário Mensal",
    "category": "Renda",
    "classification": "FIXED",
    "type": "FIXED"
  },
  {
    "id": "f4b90153-7f32-5a49-9485-5c6625199032",
    "cashFlowId": "f4b90153-7f32-5a49-9485-5c6625199032",
    "flowDate": "2026-11-10",
    "date": "2026-11-10",
    "amount": 1800.00,
    "value": 1800.00,
    "direction": "OUT",
    "description": "Aluguel Apartamento",
    "name": "Aluguel Apartamento",
    "category": "Moradia",
    "classification": "FIXED",
    "type": "FIXED"
  }
]
```

---

#### 3.2 Criar Nova Transação
`POST /cashflow` (Protegido - Bearer Token)

Registra uma nova receita ou despesa.

- **Corpo da Requisição** (`CreateCashFlowRequest`):
```json
{
  "name": "Supermercado Semanal",
  "detail": "Alimentação",
  "amount": 450.75,
  "type": "EXPENSE_VARIABLE",
  "category": "Alimentação",
  "date": "2026-11-15"
}
```

- **Resolução Automática de Campos**:
  - `amount` ou `value`: Obrigatório, valor decimal positivo (`@DecimalMin("0.01")`).
  - `name` / `detail` / `description`: Normaliza a descrição textual do item.
  - `type` / `direction` / `classification`:
    - `INCOME`: Define `direction = "IN"`.
    - `EXPENSE_FIXED` ou `FIXED`: Define `direction = "OUT"`, `classification = "FIXED"`.
    - `EXPENSE_VARIABLE` ou `VARIABLE`: Define `direction = "OUT"`, `classification = "VARIABLE"`.
  - `date` ou `flowDate`: Opcional (preenche com a data atual se omitido).

- **Resposta (`201 Created`)**:
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "cashFlowId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "flowDate": "2026-11-15",
  "date": "2026-11-15",
  "amount": 450.75,
  "value": 450.75,
  "direction": "OUT",
  "description": "Supermercado Semanal - Alimentação",
  "name": "Supermercado Semanal - Alimentação",
  "category": "Alimentação",
  "classification": "VARIABLE",
  "type": "VARIABLE"
}
```

---

#### 3.3 Obter Resumo Financeiro & Orçamento Mensal
`GET /cashflow/summary` (Protegido - Bearer Token)

Calcula o orçamento mensal, o total de gastos, o total de receitas, o saldo restante e a distribuição por categoria. Receitas na categoria `Salário` substituem a previsão salarial do perfil naquele mês.

- **Parâmetros de Consulta**:
  - `month` (opcional, inteiro): `1` a `12` (padrão: mês corrente).
  - `year` (opcional, inteiro): Ano de 4 dígitos (padrão: ano corrente).

- **Resposta (`200 OK`)**:
```json
{
  "monthlyBudget": 8500.00,
  "totalSpent": 2250.75,
  "totalIncome": 8500.00,
  "remainingBudget": 6249.25,
  "categories": [
    {
      "name": "Moradia",
      "spent": 1800.00,
      "percentage": 79.97
    },
    {
      "name": "Alimentação",
      "spent": 450.75,
      "percentage": 20.03
    }
  ]
}
```

---

#### 3.4 Obter Transação por ID
`GET /cashflow/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`) - Identificador da transação.
- **Resposta (`200 OK`)**: Objeto `CashFlowResponse`.
- **Respostas de Erro**: `404 Not Found` caso não exista ou não pertença ao usuário autenticado.

---

#### 3.5 Atualizar Transação
`PATCH /cashflow/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`)
- **Corpo da Requisição** (`UpdateCashFlowRequest`):
```json
{
  "amount": 480.00,
  "detail": "Supermercado e Feira"
}
```

- **Resposta (`200 OK`)**: `CashFlowResponse` atualizado.
- **Respostas de Erro**: `404 Not Found`.

---

#### 3.6 Excluir Transação
`DELETE /cashflow/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`)
- **Resposta (`204 No Content`)**: Sem corpo.
- **Respostas de Erro**: `404 Not Found`.

---

### 4. Objetivos Financeiros & Metas (`/goals`)

#### 4.1 Listar Metas Financeiras
`GET /goals` (Protegido - Bearer Token)

Retorna todas as metas cadastradas com cálculo dinâmico da porcentagem de progresso (`progressPercentage`).

- **Resposta (`200 OK`)**:
```json
[
  {
    "id": "11223344-5566-7788-99aa-bbccddeeff00",
    "goalId": "11223344-5566-7788-99aa-bbccddeeff00",
    "name": "Reserva de Emergência",
    "title": "Reserva de Emergência",
    "description": "6 meses de despesas fixas",
    "category": "6 meses de despesas fixas",
    "currentValue": 5000.00,
    "currentAmount": 5000.00,
    "targetValue": 25000.00,
    "targetAmount": 25000.00,
    "progressPercentage": 20.0,
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "deadline": "2026-12-31"
  }
]
```

---

#### 4.2 Criar Nova Meta
`POST /goals` (Protegido - Bearer Token)

- **Corpo da Requisição** (`CreateGoalRequest`):
```json
{
  "title": "Reserva de Emergência",
  "category": "Segurança Financeira",
  "targetAmount": 25000.00,
  "currentAmount": 5000.00,
  "startDate": "2026-01-01",
  "deadline": "2026-12-31"
}
```

- **Regras dos Campos**:
  - `title` ou `name`: Obrigatório (`@NotBlank`).
  - `targetAmount` ou `targetValue`: Obrigatório, positivo (`@NotNull`, `@DecimalMin("0.01")`).
  - `currentAmount` ou `currentValue`: Opcional (padrão: `0.0`).
  - `deadline` ou `endDate`: Opcional, data limite.

- **Resposta (`201 Created`)**: Objeto `GoalResponse`.

---

#### 4.3 Obter Meta por ID
`GET /goals/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`)
- **Resposta (`200 OK`)**: Objeto `GoalResponse`.
- **Respostas de Erro**: `404 Not Found`.

---

#### 4.4 Atualizar Meta
`PATCH /goals/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`)
- **Corpo da Requisição** (`UpdateGoalRequest`):
```json
{
  "currentAmount": 8000.00
}
```

- Para limpar a data final opcional, envie `{"clearEndDate": true}`. Não envie `endDate` ou `deadline` com data nesse caso; a combinação retorna `400 Bad Request`. Os dois campos podem ser omitidos ou nulos.
- Para definir a data, envie `endDate` ou `deadline` no formato `AAAA-MM-DD`; se ambos tiverem valores, `endDate` prevalece. Sem `clearEndDate: true`, datas omitidas ou nulas preservam a data existente.
- **Resposta (`200 OK`)**: `GoalResponse` atualizado com recalculo automático do progresso; após a limpeza, `endDate` e `deadline` são nulos.
- **Respostas de Erro**: `400 Bad Request`, `404 Not Found`.

---

#### 4.5 Excluir Meta
`DELETE /goals/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`)
- **Resposta (`204 No Content`)**: Sem corpo.
- **Respostas de Erro**: `404 Not Found`.

---

### 5. Proxy de Dados de Mercado BRAPI (`/investments`)

O backend consulta a BRAPI e devolve os campos da cotação no primeiro nível de cada resultado. Cotações válidas ficam em cache por 60 segundos. A resposta lista os símbolos sem cotação em `unavailableSymbols`.

#### 5.1 Consultar Cotações de Ativos (Multi-Ticker)
`GET /investments/quotes` (Público / Protegido)

Retorna cotações de ações, fundos imobiliários, BDRs e índices da B3.

- **Parâmetros de Consulta**:
  - `symbols` (obrigatório, string separada por vírgula): ex: `PETR4,VALE3,ITUB4,HGLG11`.

- **Resposta (`200 OK`)**:
```json
{
  "results": [
    {
      "symbol": "PETR4",
      "shortName": "PETROBRAS PN N2",
      "longName": "Petróleo Brasileiro S.A. - Petrobras",
      "currency": "BRL",
      "regularMarketPrice": 38.50,
      "regularMarketDayHigh": 38.90,
      "regularMarketDayLow": 38.10,
      "regularMarketChange": 0.55,
      "regularMarketChangePercent": 1.45,
      "regularMarketTime": "2026-11-19T18:00:00.000Z",
      "logourl": "https://s3-symbol-logo.tradingview.com/petrobras--big.svg"
    },
    {
      "symbol": "VALE3",
      "shortName": "VALE ON NM",
      "regularMarketPrice": 62.10,
      "regularMarketChangePercent": -0.80,
      "logourl": "https://s3-symbol-logo.tradingview.com/vale--big.svg"
    }
  ],
  "unavailableSymbols": ["ITUB4"]
}
```

---

#### Fechamento de referência por data

`GET /investments/reference-price?symbol=PETR4&date=2026-06-14` (Protegido)

Retorna `tradingDate` (data do pregão), `price` (decimal como texto) e `raw` (indica uso de fechamento sem ajuste). A consulta procura o fechamento na data solicitada ou nos 14 dias anteriores. O preço serve como referência para o cadastro e pode incluir ajustes históricos.

Retorna 400 para parâmetros inválidos ou data futura, 404 quando a resposta não contém um fechamento utilizável no período e 502 se a consulta à BRAPI falhar.

#### Histórico de cotações

`GET /investments/history?symbol=PETR4&range=1mo`

Aceita `1d`, `5d`, `1mo` ou `3mo`. Os pontos diários são devolvidos em `results`.

#### 5.2 Pesquisar Ativos de Mercado
`GET /investments/market/search` (Público / Protegido)

Realiza busca por tickers, nomes de empresas e setores para auto-completar e listagens.

- **Parâmetros de Consulta**:
  - `q` (obrigatório, string): Termo de busca (ex: `PETR` ou `Itaú`).

- **Resposta (`200 OK`)**:
```json
{
  "results": [
    {
      "stock": "PETR4",
      "name": "PETROBRAS PN",
      "close": 38.50,
      "change": 1.45,
      "volume": 45000000,
      "market_cap": 500000000000,
      "logo": "https://s3-symbol-logo.tradingview.com/petrobras--big.svg",
      "sector": "Petróleo, Gás e Biocombustíveis",
      "type": "stock"
    }
  ]
}
```

---

### 6. Carteira & Custódia de Investimentos (`/portfolio`)

#### 6.1 Obter Resumo da Carteira & Alocação
`GET /portfolio` (Protegido - Bearer Token)

Calcula as métricas da carteira do usuário: total investido, valor atualizado de mercado, lucro/prejuízo financeiro e percentual, divisão percentual por classe de ativos e listagem completa dos ativos em custódia.

- **Resposta (`200 OK`)**:
```json
{
  "totalInvested": 15400.00,
  "currentTotalValue": 16940.00,
  "totalProfit": 1540.00,
  "profitPercentage": 10.0,
  "totalAssets": 2,
  "distribution": [
    {
      "category": "Ações",
      "value": 11550.00,
      "percentage": 68.18
    },
    {
      "category": "FIIs",
      "value": 5390.00,
      "percentage": 31.82
    }
  ],
  "holdings": [
    {
      "id": "44556677-8899-00aa-bbcc-ddeeff001122",
      "investmentId": "44556677-8899-00aa-bbcc-ddeeff001122",
      "symbol": "PETR4",
      "name": "PETROBRAS PN",
      "originalQuantity": 300,
      "remainingQuantity": 300,
      "purchaseUnitPrice": 35.00,
      "currentPrice": 38.50,
      "totalInvested": 10500.00,
      "currentTotalValue": 11550.00,
      "profit": 1050.00,
      "profitPercentage": 10.0,
      "purchaseDate": "2026-06-15"
    }
  ]
}
```

---

Cada posição inclui `priceStatus` (`MARKET`, `ESTIMATED`, `STALE` ou `UNAVAILABLE`) e `quotedAt`, quando a BRAPI informa um horário válido. Cotações com mais de 24 horas recebem `STALE`. Se a cotação estiver indisponível, o total usa o custo de compra daquela posição.

#### 6.2 Listar Ativos em Custódia
`GET /portfolio/holdings` (Protegido - Bearer Token)

- **Resposta (`200 OK`)**: Lista com os objetos `HoldingResponse`.

---

#### 6.3 Adicionar Ativo à Carteira
`POST /portfolio/holdings` (Protegido - Bearer Token)

### Tipos de investimento

Use `FIXED_INCOME` ou `VARIABLE_INCOME` em `investmentType`. No POST, a ausência do campo ou o valor nulo usa `VARIABLE_INCOME`. No PATCH, omitir o campo preserva o tipo atual. Enviar `LEGACY` retorna HTTP 400.


Registra uma compra de ativo na carteira de investimentos.

- **Corpo da Requisição** (`CreateHoldingRequest`):
```json
{
  "symbol": "PETR4",
  "name": "PETROBRAS PN",
  "quantity": 300,
  "purchaseUnitPrice": 35.00,
  "purchaseDate": "2026-06-15",
  "currentPrice": 38.50
}
```

- **Regras dos Campos**:
  - `symbol`: Obrigatório (`@NotBlank`).
  - `quantity` ou `originalQuantity`: Obrigatório, decimal positivo (`@NotNull`, `@DecimalMin("0.0000000001")`).
  - `purchaseUnitPrice` ou `price`: Obrigatório, decimal não negativo (`@NotNull`, `@DecimalMin("0.0")`).
  - `purchaseDate`: Opcional (padrão: data de hoje).
  - `currentPrice`: Opcional (padrão: preço de compra unitário).

- **Resposta (`201 Created`)**: Objeto `HoldingResponse`.

---

#### 6.4 Obter Ativo por ID
`GET /portfolio/holdings/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`)
- **Resposta (`200 OK`)**: Objeto `HoldingResponse`.
- **Respostas de Erro**: `404 Not Found`.

---

#### 6.5 Atualizar Ativo
`PATCH /portfolio/holdings/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`)
- **Corpo da Requisição** (`UpdateHoldingRequest`):
```json
{
  "currentPrice": 40.00
}
```

- **Resposta (`200 OK`)**: Objeto `HoldingResponse` atualizado.
- **Respostas de Erro**: `404 Not Found`.

---

#### 6.6 Excluir Ativo
`DELETE /portfolio/holdings/{id}` (Protegido - Bearer Token)

- **Parâmetro de Caminho**: `id` (`UUID`)
- **Resposta (`204 No Content`)**: Sem corpo.
- **Respostas de Erro**: `404 Not Found`.

---

### 7. Assessoria IA & Perfil de Risco (`/ai`)

#### 7.1 Obter Perfil de Risco do Usuário
`GET /ai/profile` (Protegido - Bearer Token)

Retorna a classificação de tolerância ao risco do investidor, síntese dos objetivos e sugestão de alocação de ativos.

- **Resposta (`200 OK`)**:
```json
{
  "profile": "Moderado",
  "riskTolerance": "Média",
  "summary": "Perfil focado em equilíbrio entre segurança e rentabilidade com exposição controlada à renda variável.",
  "objectives": [
    "Crescimento de patrimônio a médio e longo prazo",
    "Proteção contra inflação",
    "Geração de renda passiva com fundos imobiliários"
  ],
  "suggestedAllocation": {
    "Renda Fixa": 50.0,
    "Ações / ETFs": 30.0,
    "Fundos Imobiliários (FIIs)": 15.0,
    "Reserva de Oportunidade": 5.0
  }
}
```

---

#### 7.2 Avaliar Questionário de Perfil de Investidor
`POST /ai/profile/evaluate` (Protegido - Bearer Token)

Submete respostas do questionário, tempo de experiência e tolerância a perdas para classificar o perfil do investidor.

- **Corpo da Requisição** (`EvaluateRiskProfileRequest`):
```json
{
  "answers": [
    "Tenho interesse em crescer meu patrimônio a longo prazo",
    "Aceito oscilações moderadas de curto prazo em busca de maiores retornos"
  ],
  "investmentExperienceYears": 3,
  "reactionToMarketDrop": "Mantenho a posição e compro mais se fizer sentido",
  "investmentHorizon": "5 a 10 anos"
}
```

- **Resposta (`200 OK`)**: Objeto `RiskProfileResponse` atualizado.

---

#### 7.3 Obter Recomendações de Investimento Personalizadas
`GET /ai/recommendations` (Protegido - Bearer Token)

Gera recomendações de ativos recomendados alinhados à classe e ao perfil de risco do usuário.

- **Resposta (`200 OK`)**:
```json
[
  {
    "title": "Tesouro IPCA+ 2035",
    "symbol": "IPCA2035",
    "category": "Renda Fixa",
    "risk": "Baixo",
    "description": "Título público indexado à inflação, ideal para proteção de poder de compra e objetivos de longo prazo.",
    "expectedReturn": "IPCA + 6.20% a.a.",
    "minInvestment": "R$ 35,00"
  },
  {
    "title": "BOVA11 - iShares Ibovespa",
    "symbol": "BOVA11",
    "category": "ETFs / Renda Variável",
    "risk": "Médio-Alto",
    "description": "ETF que replica o Índice Bovespa, proporcionando diversificação instantânea nas maiores empresas do Brasil.",
    "expectedReturn": "Retorno histórico atrelado ao Ibovespa",
    "minInvestment": "R$ 120,00"
  },
  {
    "title": "HGLG11 - CSHG Logística",
    "symbol": "HGLG11",
    "category": "Fundos Imobiliários (FIIs)",
    "risk": "Médio",
    "description": "Fundo imobiliário de galpões logísticos de alto padrão com histórico consolidado de distribuição de dividendos mensais.",
    "expectedReturn": "Dividend Yield aprox. 8.5% a.a.",
    "minInvestment": "R$ 160,00"
  }
]
```

---

## Guia de Integração de Clientes

### Exemplos de Fluxo Completo (cURL)

#### 1. Cadastro Unificado
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "SecurePassword123!",
    "cpf": "123.456.789-00",
    "nickname": "Jane",
    "occupation": "Engenheira de Software",
    "salary": 8500.00,
    "openFinance": true
  }'
```

#### 2. Autenticação & Obtenção do Token JWT
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "jane.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

#### 3. Registro de Despesa no Fluxo de Caixa
```bash
curl -X POST http://localhost:8080/cashflow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "name": "Aluguel",
    "amount": 1800.00,
    "type": "EXPENSE_FIXED",
    "category": "Moradia"
  }'
```

#### 4. Adição de Ativo na Carteira
```bash
curl -X POST http://localhost:8080/portfolio/holdings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{
    "symbol": "PETR4",
    "name": "PETROBRAS PN",
    "quantity": 100,
    "purchaseUnitPrice": 35.50
  }'
```

#### 5. Consulta de Recomendações da IA
```bash
curl -X GET http://localhost:8080/ai/recommendations \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

### Implementação de Cliente em TypeScript / Axios

Exemplo de cliente pronto para produção com anexação automática de Bearer token e interceptor para renovação automática (refresh):

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setAuthTokens = (tokens: { accessToken?: string; refreshToken?: string }) => {
  if (tokens.accessToken) accessToken = tokens.accessToken;
  if (tokens.refreshToken) refreshToken = tokens.refreshToken;
};

export const clearAuthTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Injeta automaticamente o token JWT Bearer
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor de Resposta: Renovação automática de token no erro 401 Unauthorized
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        setAuthTokens(data);
        processQueue(null, data.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        clearAuthTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

### Foto de perfil

`DELETE /user/me/avatar` remove a foto do usuário autenticado e retorna HTTP 204.

Ambos os endpoints exigem `Authorization: Bearer <accessToken>` e acessam apenas o perfil do usuário autenticado.

- `POST /user/me/avatar`: envie `multipart/form-data` com o campo `file` contendo JPEG (`image/jpeg`) ou PNG (`image/png`), de no máximo 2 MiB. Substitui a imagem anterior. Retorna `204 No Content`; arquivos vazios retornam `400`, formatos incompatíveis retornam `415` e requisições multipart grandes podem retornar `413`.
- `GET /user/me/avatar`: retorna `200` com os bytes da imagem e o `Content-Type` correspondente, ou `404` se não houver imagem ou perfil. A resposta não é armazenada em cache.

```bash
curl -X POST "$BASE_URL/user/me/avatar" -H "Authorization: Bearer $TOKEN" -F 'file=@avatar.png;type=image/png'
curl "$BASE_URL/user/me/avatar" -H "Authorization: Bearer $TOKEN" -o avatar.png
```

### Perfil, recorrências e posições vinculadas

- `PATCH /user/me` edita `name`, `nickname`, `occupation` e `salary`. Envie `salary: null` para limpar a previsão. Campos omitidos mantêm seus valores.
- `GET /cashflow/recurrences` lista regras. `POST /cashflow/recurrences` aceita `description`, `category`, `amount`, `firstDate`, `lastDate` (opcional) e `existingCashFlowId` (para converter gasto fixo). `PUT /cashflow/recurrences/{id}` altera os valores futuros mantendo a primeira data. `DELETE /cashflow/recurrences/{id}` encerra os próximos vencimentos. A exclusão de um lançamento gerado afeta só aquela ocorrência.
- Em `/portfolio/holdings`, envie `fixedIncome` com `product` (`CDB`, `CAIXINHA`, `OTHER`), `institution`, `maturityDate` e `cdiPercentage`. Use `annualRate` para prefixados ou `fixedIncome.cdiPercentage` para CDI. A resposta informa `valuationThrough` quando há uma data-base e `logoUrl` quando há uma imagem.
- Em `/goals`, `progressMode` aceita `MANUAL` ou `PORTFOLIO`. Para vincular uma meta de investimento, envie `holdingIds` com ao menos uma posição da conta. A resposta informa `valuationStatus`. `UNLINKED` indica que a meta perdeu todas as posições vinculadas.
