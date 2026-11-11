# InvesteAI

O **InvesteAI** é uma aplicação de gestão financeira pessoal desenvolvida como **projeto final universitário da Universidade Católica de Brasília (UCB)**. Seu propósito é ajudar o usuário a acompanhar receitas, gastos, investimentos e objetivos financeiros em um único lugar. É uma **prova de conceito (POC)**: os valores registrados servem para organização e acompanhamento, sem movimentação de dinheiro real, conexão com contas bancárias ou execução de investimentos.

## Equipe

Projeto desenvolvido por três participantes:

- Gustavo Lucena de Aguiar
- Camila Graner
- João Pedro Nunes Neto

## Sobre o projeto

A proposta do InvesteAI é oferecer uma visão organizada da vida financeira e facilitar o acompanhamento de decisões e metas. O usuário pode registrar diretamente os valores que recebeu, gastou ou destinou a investimentos, categorizá-los e consultar resumos para entender sua evolução.

O escopo também contempla o acompanhamento de **objetivos financeiros** e o registro de lançamentos recorrentes, como depósitos de salário e deduções de aluguel. Esses registros representam movimentações dentro do controle financeiro da aplicação: **não são transferências, pagamentos, débitos bancários ou transações com dinheiro real**.

A experiência é organizada em áreas de início, investimentos, gastos e assessoria relacionada a investimentos, além de fluxos de conta e perfil. A área de assessoria contempla perfil de investidor, recomendações e chatbot como recursos de apoio à organização financeira. Exemplos de investimentos, categorias, objetivos e valores servem para ilustrar o uso do sistema; não representam cotações, saldos bancários ou recomendações financeiras.

## Funcionalidades do produto

- **Visão geral financeira:** resumir valores e oferecer atalhos para as principais áreas.
- **Registro de receitas e gastos:** permitir que o usuário informe valores manualmente e acompanhe despesas por categoria.
- **Gastos fixos e variáveis:** organizar despesas recorrentes e pontuais, com histórico e referência a orçamento mensal.
- **Acompanhamento de investimentos:** registrar e visualizar valores destinados a investimentos, sem executar ordens de compra ou venda.
- **Objetivos financeiros:** acompanhar metas, como acumular determinado valor ou reduzir gastos em uma categoria.
- **Lançamentos recorrentes:** apoiar o controle de eventos como salário recebido e aluguel pago, sem movimentar dinheiro real.
- **Perfil e assessoria de investimentos:** apresentar informações relacionadas ao perfil do usuário e apoiar sua organização financeira.
- **Conta de usuário:** contemplar cadastro, login, recuperação de senha e perfil.

## Tecnologias

| Componente | Tecnologias |
| --- | --- |
| Aplicativo móvel | TypeScript, React Native, Expo, React Navigation |
| API | Java 21, Spring Boot, Maven |
| Persistência | Spring Data JPA, PostgreSQL, Flyway |
| Segurança e documentação da API | Spring Security, JWT, Springdoc OpenAPI |
| Execução em contêineres | Docker e Docker Compose |

## Organização do projeto

```text
InvesteAI/
├── React-Native/                 # Aplicativo móvel e interface do usuário
│   ├── App.tsx                   # Navegação raiz e fluxos de conta
│   ├── index.ts                  # Inicialização do Expo
│   └── source/
│       ├── routes/
│       │   ├── AI/               # Perfil de investidor e área de assessoria
│       │   ├── Cadastro/         # Cadastro de usuário
│       │   ├── EsqueciSenha/     # Recuperação de senha
│       │   ├── Gastos/           # Gastos, categorias, fixos, variáveis e histórico
│       │   ├── Home/             # Resumo financeiro e objetivos
│       │   ├── Investimentos/    # Área de investimentos
│       │   ├── Login/            # Entrada na conta
│       │   └── Perfil/           # Perfil do usuário
│       ├── shared/               # Componentes e utilitários compartilhados
│       └── styles/               # Estilos e cores
├── backend/                      # API e lógica de servidor
│   ├── Dockerfile                # Imagem da aplicação Java
│   ├── pom.xml                   # Dependências e build Maven
│   └── src/
│       ├── main/java/com/InvesteAI/backend/
│       │   ├── BackendApplication.java # Inicialização Spring Boot
│       │   ├── Controller/             # Endpoints HTTP
│       │   ├── config/                 # Configurações
│       │   ├── filter/                 # Filtros HTTP
│       │   ├── model/                  # Entidades de domínio
│       │   ├── repository/             # Acesso a dados
│       │   ├── security/                # Componentes de segurança
│       │   └── service/                 # Regras e serviços
│       ├── src/main/resources/
│       │   ├── application.properties  # Configurações da aplicação
│       │   └── db/migration/           # Migrações Flyway
│       └── src/test/                    # Testes do backend
└── compose.yaml                 # Inicialização da API e do PostgreSQL
```

## Como as partes se relacionam

O aplicativo Expo/React Native é a interface usada para navegar pelas áreas financeiras. A API Spring Boot fornece a camada de servidor, e o PostgreSQL persiste os dados; Spring Data JPA mapeia as entidades e Flyway gerencia as migrações do banco. A configuração do backend contempla segurança com Spring Security e JWT. O fluxo funcional é que a interface envie operações à API, que valida e processa os dados e os persiste no banco.

## Pré-requisitos

- **Aplicativo:** Node.js e npm, além do aplicativo **Expo Go** instalado no celular. Para usar um emulador, configure o ambiente de desenvolvimento da plataforma correspondente.
- **Backend e banco:** Docker e Docker Compose.

## Configuração do ambiente

O backend utiliza as variáveis abaixo para conectar ao banco e assinar tokens. Crie um arquivo `.env` na raiz do projeto, ao lado de `compose.yaml`:

```dotenv
POSTGRES_DB=investeai
POSTGRES_USER=investeai
POSTGRES_PASSWORD=defina-uma-senha-local
JWT_SECRET=defina-um-segredo-aleatorio-forte
```

Use valores próprios para seu ambiente e **não versione nem compartilhe esse arquivo**. A configuração do backend também aceita variáveis opcionais para expiração de tokens e origens CORS:

```dotenv
JWT_ACCESS_TOKEN_EXPIRATION_MS=900000
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006,http://localhost:3000
```

Os valores de expiração acima correspondem aos padrões definidos pela configuração. Ajuste as origens CORS ao ambiente em que a interface será executada.

## Como executar

### 1. Iniciar o backend e o banco de dados

Na raiz do projeto, com o `.env` criado:

```bash
docker compose up --build
```

O Compose inicia a API e o PostgreSQL. As portas configuradas são `8080` para a API e `5432` para o banco. Para parar os serviços:

```bash
docker compose down
```

Para apagar também o volume persistente do banco de dados — **isso remove os dados armazenados**:

```bash
docker compose down --volumes
```

### 2. Abrir o aplicativo com Expo Go

Instale o **Expo Go** no celular pela loja de aplicativos. No terminal, acesse a pasta do aplicativo, instale as dependências e inicie o servidor de desenvolvimento Expo:

```bash
cd React-Native
npm ci
npx expo start
```

`npm ci` instala as dependências exatamente nas versões registradas no `package-lock.json`. É indicado para preparar uma instalação reproduzível; se já existir uma pasta `node_modules`, o comando a recria com base no lockfile.

Quando o Expo exibir o QR code, escaneie-o com o Expo Go para abrir o aplicativo. Se o celular não conseguir se conectar ao computador pela rede local, o modo túnel é uma alternativa:

```bash
npx expo start --tunnel
```

Para executar em um emulador ou navegador, os scripts definidos no `package.json` incluem:

```bash
npm run android
npm run ios
npm run web
```

A execução para iOS normalmente requer macOS e as ferramentas de desenvolvimento da Apple. A disponibilidade de cada destino depende do ambiente instalado.

## API

O backend contém endpoints de usuário sob o prefixo `/auth`, implementados em `UserController`:

| Método | Rota | Finalidade |
| --- | --- | --- |
| `POST` | `/auth/register` | Receber cadastro de usuário |
| `GET` | `/auth/{id}` | Buscar usuário pelo identificador |
| `GET` | `/auth/all` | Listar usuários |
| `PUT` | `/auth/{id}` | Atualizar usuário |
| `DELETE` | `/auth` | Excluir usuário a partir do identificador enviado no corpo da requisição |

A entidade `User` e a migração Flyway inicial definem a persistência de usuários no PostgreSQL. A dependência Springdoc OpenAPI está presente no backend. Antes de disponibilizar endpoints, revise autenticação e autorização, validação, tratamento de erros e os dados retornados pela API.

## Segurança e uso responsável

- Esta é uma POC acadêmica de controle financeiro: não movimenta dinheiro real e não deve ser usada como instituição financeira ou corretora.
- Utilize dados fictícios nos testes. Não forneça senhas bancárias, tokens de instituições ou informações financeiras sensíveis.
- Mantenha `.env`, `JWT_SECRET`, senhas e demais credenciais fora do Git.
- A migração inicial do banco contém um registro de usuário de teste. Trate-o apenas como dado de desenvolvimento e revise os dados de inicialização antes de qualquer implantação compartilhada.
- Não disponibilize a API publicamente sem revisar segurança, autorização, exposição de dados pessoais e configurações de produção.
- As informações e exemplos de investimentos não constituem recomendação financeira.

## Informações acadêmicas

**Instituição:** Universidade Católica de Brasília (UCB)  
**Tipo de projeto:** Projeto final universitário / prova de conceito (POC)  
**Participantes:** Gustavo Lucena de Aguiar, Camila Graner e João Pedro Nunes Neto
