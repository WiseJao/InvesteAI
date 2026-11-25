# InvesteAI REST API Documentation

Comprehensive API documentation for the **InvesteAI** backend service.

---

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Global Conventions & Headers](#global-conventions--headers)
3. [Authentication & Security Flow](#authentication--security-flow)
4. [Rate Limiting](#rate-limiting)
5. [Standard Error Responses](#standard-error-responses)
6. [Endpoint Reference](#endpoint-reference)
   - [1. Authentication & Recovery (`/auth`)](#1-authentication--recovery-auth)
   - [2. User & Profile Management (`/user`)](#2-user--profile-management-user)
   - [3. Cash Flow & Expense Tracking (`/cashflow`)](#3-cash-flow--expense-tracking-cashflow)
   - [4. Financial Goals Management (`/goals`)](#4-financial-goals-management-goals)
   - [5. Market Data BRAPI Proxy (`/investments`)](#5-market-data-brapi-proxy-investments)
   - [6. Investment Portfolio Holdings (`/portfolio`)](#6-investment-portfolio-holdings-portfolio)
   - [7. AI Advisory & Risk Profiling (`/ai`)](#7-ai-advisory--risk-profiling-ai)
7. [Client Integration Guide](#client-integration-guide)
   - [End-to-End Workflow Examples (cURL)](#end-to-end-workflow-examples-curl)
   - [TypeScript / Axios Client Implementation](#typescript--axios-client-implementation)

---

## Overview & Architecture

InvesteAI provides a high-throughput, modular RESTful API built on Spring Boot 3, Java 21, and PostgreSQL. It exposes financial management features including unified onboarding, expense and income tracking, financial goal tracking, BRAPI market data aggregation, investment portfolio tracking, and AI-driven risk profiling.

### Base URLs
- **Local Development**: `http://localhost:8080`
- **Default Port**: `8080`

---

## Global Conventions & Headers

- **Payload Format**: All requests containing a body must transmit JSON formatted with `Content-Type: application/json; charset=UTF-8`.
- **Response Format**: All endpoints return `application/json; charset=UTF-8` unless returning empty responses (`204 No Content`).
- **Date & Time Standards**:
  - Dates use ISO-8601 extended calendar date format: `YYYY-MM-DD` (e.g. `2026-11-19`).
  - Timestamps use ISO-8601 UTC format: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g. `2026-11-19T06:22:00.000Z`).
- **Numeric Precision**:
  - Monetary values are represented as high-precision decimals (`BigDecimal` / string-safe decimal numbers).
  - Percentages are represented as decimal numbers between `0.0` and `100.0`.
- **Identifiers**: Entity IDs are UUIDs formatted as standard 36-character hexadecimal strings (e.g. `3fa85f64-5717-4562-b3fc-2c963f66afa6`).

### Security Header
Protected endpoints require an `Authorization` header containing a valid Bearer JWT:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## Authentication & Security Flow

Authentication uses stateless JSON Web Tokens (JWT):
1. **Access Token**: Short-lived token (default: 15 minutes) passed in the `Authorization` header.
2. **Refresh Token**: Long-lived token (default: 7 days) used with `POST /auth/refresh` to obtain a fresh access token without re-entering credentials.
3. **Unified Registration**: A single `POST /auth/register` creates the user identity, personal profile, and onboarding form answers atomically inside a single database transaction.

---

## Rate Limiting

The default per-IP quota is 60 requests per minute for general routes and 10 for authentication and credential changes. Requests above the quota receive HTTP 429.

---

## Standard Error Responses

Use the HTTP status to handle failures. The response body depends on the endpoint and may be empty.

### Common HTTP Status Codes
| Status Code | Meaning | Description |
|:---|:---|:---|
| `200 OK` | Success | The request was processed successfully and response body is included. |
| `201 Created` | Created | A new resource was successfully created. |
| `204 No Content` | No Content | The resource was deleted or processed successfully with no response body. |
| `400 Bad Request` | Bad Request | Invalid JSON payload, missing required parameters, or business constraint failure. |
| `401 Unauthorized` | Unauthorized | Missing, expired, or invalid JWT token / invalid credentials. |
| `403 Forbidden` | Forbidden | Insufficient permissions for the requested resource. |
| `404 Not Found` | Not Found | Resource with the specified identifier was not found. |
| `429 Too Many Requests` | Rate Limited | Request quota exceeded for the client IP. |
| `500 Internal Server Error` | Server Error | Unhandled server error. |

---

## Endpoint Reference

### 1. Authentication & Recovery (`/auth`)

#### 1.1 Unified Registration
`POST /auth/register` (Public)

Creates a new `User`, `Profile`, and `Form` record atomically in a single transactional request.

- **Request Body** (`UnifiedRegisterRequest` / `RegisterRequest`):
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

- **Field Validation Rules**:
  - `name`: Required, max 255 chars (`@NotBlank`, `@Size(max = 255)`).
  - `email`: Required, valid email format, max 255 chars (`@NotBlank`, `@Email`, `@Size(max = 255)`).
  - `password`: Required (`@NotBlank`).
  - `cpf`: Required (`@NotBlank`), formatted or digits-only.
  - `salary`: Optional, numeric (`BigDecimal`).
  - `salaryDate`: Optional, ISO date (`LocalDate`).
  - `openFinance`: Optional, boolean (defaults to `false`).

- **Response (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Error Responses**:
  - `400 Bad Request`: Duplicate CPF or Email, or validation error.

---

#### 1.2 User Login
`POST /auth/login` (Public)

Authenticates user via Email or CPF (with or without formatting) and password.

- **Request Body** (`LoginRequest`):
```json
{
  "identifier": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```

- **Field Validation Rules**:
  - `identifier`: Required (`@NotBlank`), accepts email address or CPF.
  - `password`: Required (`@NotBlank`).

- **Response (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Error Responses**:
  - `401 Unauthorized`: Invalid credentials.

---

#### 1.3 Refresh Access Token
`POST /auth/refresh` (Public)

Issues a new access and refresh token pair using an unexpired refresh token.

- **Request Body** (`RefreshTokenRequest`):
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Response (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Error Responses**:
  - `401 Unauthorized`: Refresh token is invalid or expired.

---

#### 1.4 User Logout
`POST /auth/logout` (Public)

The client clears its session. Issued tokens remain valid until expiration.

- **Request Body**: None (empty body).
- **Response (`200 OK`)**:
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

#### 1.5 Password recovery and reset

`POST /auth/forgot-password` · `POST /auth/reset-password`

Both return HTTP 503. Password recovery requires a verified delivery channel.

---

### 2. User & Profile Management (`/user`)

#### 2.1 Get Current User Profile
`GET /user/me` (Protected - Bearer Token)

Returns the authenticated user's profile and account attributes.

- **Headers**: `Authorization: Bearer <token>`
- **Response (`200 OK`)**:
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

#### 2.2 Change password

`PUT /users/me/password`

Requires an access token and a JSON body with `currentPassword` and `newPassword`. Returns HTTP 204 on success.

---

### 3. Cash Flow & Expense Tracking (`/cashflow`)

#### 3.1 List Cash Flow Transactions
`GET /cashflow` (Protected - Bearer Token)

Lists all income and expense transactions for the authenticated user, supporting optional filtering by month, year, and transaction type.

- **Query Parameters**:
  - `month` (optional, integer): `1` to `12`.
  - `year` (optional, integer): Four-digit year (e.g. `2026`).
  - `type` (optional, string): Filter by classification or direction (`INCOME`, `EXPENSE_FIXED`, `EXPENSE_VARIABLE`, `FIXED`, `VARIABLE`, `IN`, `OUT`).

- **Response (`200 OK`)**:
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

#### 3.2 Create Cash Flow Transaction
`POST /cashflow` (Protected - Bearer Token)

Creates a new financial transaction (income or expense).

- **Request Body** (`CreateCashFlowRequest`):
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

- **Field Resolution**:
  - `amount` or `value`: Required, positive decimal (`@DecimalMin("0.01")`).
  - `name` / `detail` / `description`: Resolves description text.
  - `type` / `direction` / `classification`:
    - `INCOME`: Resolves `direction = "IN"`.
    - `EXPENSE_FIXED` / `FIXED`: Resolves `direction = "OUT"`, `classification = "FIXED"`.
    - `EXPENSE_VARIABLE` / `VARIABLE`: Resolves `direction = "OUT"`, `classification = "VARIABLE"`.
  - `date` / `flowDate`: Optional (defaults to current date if omitted).

- **Response (`201 Created`)**:
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

#### 3.3 Get Cash Flow Summary & Budget Breakdown
`GET /cashflow/summary` (Protected - Bearer Token)

Computes the monthly budget, total expenses, total income, remaining balance, and category shares. Income in the `Salário` category replaces the profile salary forecast for that month.

- **Query Parameters**:
  - `month` (optional, integer): `1` to `12` (defaults to current month).
  - `year` (optional, integer): Four-digit year (defaults to current year).

- **Response (`200 OK`)**:
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

#### 3.4 Get Cash Flow by ID
`GET /cashflow/{id}` (Protected - Bearer Token)

- **Path Parameter**: `id` (`UUID`) - Transaction identifier.
- **Response (`200 OK`)**: `CashFlowResponse` object.
- **Error Responses**: `404 Not Found` if the transaction does not exist or belongs to another user.

---

#### 3.5 Update Cash Flow Transaction
`PATCH /cashflow/{id}` (Protected - Bearer Token)

Performs partial updates on an existing transaction.

- **Path Parameter**: `id` (`UUID`)
- **Request Body** (`UpdateCashFlowRequest`):
```json
{
  "amount": 480.00,
  "detail": "Supermercado e Feira"
}
```

- **Response (`200 OK`)**: Updated `CashFlowResponse`.
- **Error Responses**: `404 Not Found`.

---

#### 3.6 Delete Cash Flow Transaction
`DELETE /cashflow/{id}` (Protected - Bearer Token)

- **Path Parameter**: `id` (`UUID`)
- **Response (`204 No Content`)**: Empty body.
- **Error Responses**: `404 Not Found`.

---

### 4. Financial Goals Management (`/goals`)

#### 4.1 List Financial Goals
`GET /goals` (Protected - Bearer Token)

Lists all financial objectives and investment targets for the authenticated user, including auto-calculated progress percentages.

- **Response (`200 OK`)**:
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

#### 4.2 Create Financial Goal
`POST /goals` (Protected - Bearer Token)

Creates a new target financial objective.

- **Request Body** (`CreateGoalRequest`):
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

- **Field Rules**:
  - `title` or `name`: Required (`@NotBlank`).
  - `targetAmount` or `targetValue`: Required, positive decimal (`@NotNull`, `@DecimalMin("0.01")`).
  - `currentAmount` or `currentValue`: Optional (defaults to `0.0`).
  - `deadline` or `endDate`: Optional target completion date.

- **Response (`201 Created`)**: `GoalResponse` object.

---

#### 4.3 Get Goal by ID
`GET /goals/{id}` (Protected - Bearer Token)

- **Path Parameter**: `id` (`UUID`)
- **Response (`200 OK`)**: `GoalResponse` object.
- **Error Responses**: `404 Not Found`.

---

#### 4.4 Update Financial Goal
`PATCH /goals/{id}` (Protected - Bearer Token)

Updates current balance, target value, or deadline of an existing goal.

- **Path Parameter**: `id` (`UUID`)
- **Request Body** (`UpdateGoalRequest`):
```json
{
  "currentAmount": 8000.00
}
```

- To clear the optional end date, send `{"clearEndDate": true}`. Do not send a non-null `endDate` or `deadline` at the same time; that combination returns `400 Bad Request`.
- To set a date, send `endDate` or `deadline` in `YYYY-MM-DD` format; if both have values, `endDate` takes precedence. Without `clearEndDate: true`, omitted or null dates preserve the existing date.
- **Response (`200 OK`)**: Updated `GoalResponse` with re-calculated `progressPercentage`; after clearing, `endDate` and `deadline` are null.
- **Error Responses**: `400 Bad Request`, `404 Not Found`.

---

#### 4.5 Delete Financial Goal
`DELETE /goals/{id}` (Protected - Bearer Token)

- **Path Parameter**: `id` (`UUID`)
- **Response (`204 No Content`)**: Empty body.
- **Error Responses**: `404 Not Found`.

---

### 5. Market Data BRAPI Proxy (`/investments`)

The backend fetches market data from BRAPI and returns flattened quote fields. Successful quotes are cached for 60 seconds. The response includes unavailable tickers in `unavailableSymbols`.

#### 5.1 Get Multi-Ticker Quotes
`GET /investments/quotes` (Public)

Proxies real-time and delayed Brazilian asset quotes (Stocks, FIIs, BDRs, Indices).

- **Query Parameters**:
  - `symbols` (required, comma-separated string): e.g. `PETR4,VALE3,ITUB4,HGLG11`.

- **Response (`200 OK`)**:
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

#### Reference closing price by date

`GET /investments/reference-price?symbol=PETR4&date=2026-06-14` (Protected)

Returns `tradingDate` (trading session date), `price` (decimal string), and `raw` (whether the unadjusted close was used). It searches the requested date and the preceding 14 days. The price is a reference for recording the purchase and may include historical adjustments.

Returns 400 for invalid parameters or future dates, 404 when the response contains no usable close in the window, and 502 when the BRAPI request fails.

#### Price history

`GET /investments/history?symbol=PETR4&range=1mo`

Accepts `1d`, `5d`, `1mo`, or `3mo`. Daily data points are returned in `results`.

#### 5.2 Search Market Assets
`GET /investments/market/search` (Public / Protected)

Searches listed tickers, names, and asset classes for auto-complete and exploration.

- **Query Parameters**:
  - `q` (required, string): Search query (e.g. `PETR` or `Itaú`).

- **Response (`200 OK`)**:
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

### 6. Investment Portfolio Holdings (`/portfolio`)

#### 6.1 Get Portfolio Summary & Allocation
`GET /portfolio` (Protected - Bearer Token)

Calculates user portfolio metrics: total invested balance, current asset value, total profit/loss, asset class distribution breakdown, and full list of holdings.

- **Response (`200 OK`)**:
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

Each holding includes `priceStatus` (`MARKET`, `ESTIMATED`, `STALE`, or `UNAVAILABLE`) and `quotedAt` when BRAPI provides a valid timestamp. Quotes older than 24 hours are `STALE`. If a quote is unavailable, the total uses that holding’s purchase cost.

#### 6.2 List Portfolio Holdings
`GET /portfolio/holdings` (Protected - Bearer Token)

- **Response (`200 OK`)**: Array of `HoldingResponse` items.

---

#### 6.3 Add Portfolio Holding
`POST /portfolio/holdings` (Protected - Bearer Token)

Records a new asset purchase in the portfolio.

- **Request Body** (`CreateHoldingRequest`):
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

- **Field Rules**:
  - `symbol`: Required (`@NotBlank`).
  - `quantity` or `originalQuantity`: Required, positive decimal (`@NotNull`, `@DecimalMin("0.0000000001")`).
  - `purchaseUnitPrice` or `price`: Required, non-negative decimal (`@NotNull`, `@DecimalMin("0.0")`).
  - `purchaseDate`: Optional (defaults to today).
  - `currentPrice`: Optional (defaults to purchase price if omitted).

- **Response (`201 Created`)**: `HoldingResponse` object.

---

#### 6.4 Get Holding by ID
`GET /portfolio/holdings/{id}` (Protected - Bearer Token)

- **Path Parameter**: `id` (`UUID`)
- **Response (`200 OK`)**: `HoldingResponse` object.
- **Error Responses**: `404 Not Found`.

---

#### 6.5 Update Portfolio Holding
`PATCH /portfolio/holdings/{id}` (Protected - Bearer Token)

- **Path Parameter**: `id` (`UUID`)
- **Request Body** (`UpdateHoldingRequest`):
```json
{
  "currentPrice": 40.00
}
```

- **Response (`200 OK`)**: Updated `HoldingResponse`.
- **Error Responses**: `404 Not Found`.

---

#### 6.6 Delete Portfolio Holding
`DELETE /portfolio/holdings/{id}` (Protected - Bearer Token)

- **Path Parameter**: `id` (`UUID`)
- **Response (`204 No Content`)**: Empty body.
- **Error Responses**: `404 Not Found`.

---

### 7. AI Advisory & Risk Profiling (`/ai`)

#### 7.1 Get User Risk Profile
`GET /ai/profile` (Protected - Bearer Token)

Retrieves the user's computed risk profile classification, description, and suggested asset allocation.

- **Response (`200 OK`)**:
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

#### 7.2 Evaluate Risk Profile Questionnaire
`POST /ai/profile/evaluate` (Protected - Bearer Token)

Calculates and updates the user's risk profile based on questionnaire answers, experience years, loss tolerance, and horizon.

- **Request Body** (`EvaluateRiskProfileRequest`):
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

- **Response (`200 OK`)**: Updated `RiskProfileResponse` object.

---

#### 7.3 Get Curated AI Recommendations
`GET /ai/recommendations` (Protected - Bearer Token)

Provides tailored asset recommendations aligned with the user's evaluated investor profile.

- **Response (`200 OK`)**:
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

## Client Integration Guide

### End-to-End Workflow Examples (cURL)

#### 1. Unified Registration
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

#### 2. Login & Storing JWT
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "jane.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

#### 3. Creating a Cash Flow Entry
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

#### 4. Adding a Portfolio Holding
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

#### 5. Fetching AI Recommendations
```bash
curl -X GET http://localhost:8080/ai/recommendations \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

### TypeScript / Axios Client Implementation

Below is a production-grade TypeScript API client with automatic token attachment and token refresh interceptor:

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

// Request interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: Automatic token refresh on 401 Unauthorized
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

### Profile avatar

`DELETE /user/me/avatar` removes the authenticated user’s avatar and returns HTTP 204.

Both endpoints require `Authorization: Bearer <accessToken>` and operate only on the authenticated user's profile.

- `POST /user/me/avatar`: send `multipart/form-data` with a `file` part containing a JPEG (`image/jpeg`) or PNG (`image/png`), at most 2 MiB. Replaces any existing image. Returns `204 No Content`; empty files return `400`, unsupported or mismatched formats return `415`, and oversized multipart requests may return `413`.
- `GET /user/me/avatar`: returns `200` with the image bytes and corresponding `Content-Type`, or `404` if no image or profile exists. Responses are not cacheable.

```bash
curl -X POST "$BASE_URL/user/me/avatar" -H "Authorization: Bearer $TOKEN" -F 'file=@avatar.png;type=image/png'
curl "$BASE_URL/user/me/avatar" -H "Authorization: Bearer $TOKEN" -o avatar.png
```
