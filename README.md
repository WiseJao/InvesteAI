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
├── compose.yaml
├── docs/
│   ├── README.md
│   ├── BMC.pdf
│   ├── DADOS.pdf
│   ├── DADOS.docx
│   └── modelagens e documentos editáveis
├── api/
│   ├── README.md
│   ├── .env.example
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
└── app/
    ├── README.md
    ├── .env.example
    ├── package.json
    ├── App.tsx
    └── source/
```

O aplicativo usa React Native com Expo para Android, iOS e navegador. A versão web é executada a partir de `app/`. A API usa Java 21, Spring Boot, PostgreSQL 18 e migrações Flyway.

## Executar o projeto

1. Instale Docker com Docker Compose v2 e Node.js 22.13+ ou 24.3+.
2. Siga os guias da [API](api/README.md) e do [app](app/README.md) para criar os respectivos arquivos `.env`.
3. Abra um terminal na raiz do repositório e inicie o banco e a API com `docker compose up --build -d`. Confirme que `http://localhost:8080/actuator/health` retorna `UP`.
4. Abra outro terminal na pasta `app/` e siga o [guia do app](app/README.md) para instalar as dependências, configurar a URL da API e iniciar o aplicativo.

O Compose carrega `api/.env` automaticamente para a API e o banco. O Expo usa `app/.env`, separado das credenciais privadas.

## Referências

- [Documentação acadêmica, requisitos e modelo de dados](docs/README.md)
- [Contrato da API em português](api/API_DOCUMENTATION_PT.md)
- [Contrato da API em inglês](api/API_DOCUMENTATION.md)
