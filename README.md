# InvesteAI

O InvesteAI é uma prova de conceito acadêmica da Universidade Católica de Brasília para acompanhar receitas, despesas, carteira de investimentos e metas financeiras. O aplicativo registra dados para organização pessoal. A assessoria e o FAQ têm finalidade educacional.

## Equipe

- Gustavo Lucena de Aguiar
- Camila Graner
- João Pedro Nunes Neto

A identificação acadêmica completa e o espaço para o vídeo estão no [README da documentação](docs/README.md).

## Estrutura do projeto

```text
InvesteAI/
├── README.md
├── .env.example
├── compose.yaml
├── docs/
│   ├── README.md
│   ├── BMC.pdf
│   ├── DADOS.pdf
│   ├── DADOS.docx
│   └── modelagens e documentos editáveis
├── api/
│   ├── README.md
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
└── mobile/
    ├── README.md
    ├── package.json
    ├── App.tsx
    └── source/
```

O aplicativo usa React Native com Expo para Android, iOS e navegador. A versão web é executada a partir de `mobile/`. A API usa Java 21, Spring Boot, PostgreSQL 18 e migrações Flyway.

## Executar o projeto

1. Clone o repositório e entre na pasta `InvesteAI`.
2. Copie `.env.example` para `.env` na raiz. Siga o [guia da API](api/README.md) para configurar o arquivo `.env`, iniciar o PostgreSQL e a API e verificar `/actuator/health`.
3. Siga o [guia do aplicativo](mobile/README.md) para instalar as dependências em `mobile/`, apontar o Expo para a API e abrir o projeto na plataforma escolhida.

Execute `docker compose` a partir da raiz. O Compose, os scripts npm do Expo e o inicializador do Maven usam o mesmo `.env`.

## Referências

- [Documentação acadêmica, requisitos e modelo de dados](docs/README.md)
- [Contrato da API em português](API_DOCUMENTATION_PT.md)
- [Contrato da API em inglês](API_DOCUMENTATION.md)
