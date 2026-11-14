# InvesteAI
Repositorio referente ao projeto InvesteAI

## Autenticação e perfis

- O cadastro recebe `name`, `email`, `password` e `cpf`. O CPF aceita a pontuação padrão, é validado pelos dígitos verificadores e armazenado com onze dígitos; e-mail é normalizado para minúsculas.
- O login aceita `identifier` (e-mail ou CPF). O campo legado `email` continua aceito como alias, e a resposta JWT mantém `accessToken` e `refreshToken`.
- `users` guarda apenas e-mail, CPF, hash BCrypt da senha, status e timestamps de autenticação. `profiles` contém nome, apelido, ocupação e salário; cada perfil tem UUID próprio e `user_id` único. O cadastro persiste usuário e perfil juntos.
- `profile_images.profile_id` é a chave primária e estrangeira para `profiles`; os bytes ficam em `image_data` (`BYTEA`). A tabela existe, mas ainda não há endpoint de upload de imagem.
- Respostas que serializam `User` omitem CPF e hash da senha. Os endpoints legados de criação/atualização por entidade foram removidos; os endpoints restantes ainda não aplicam autorização por proprietário.

## Investimentos e histórico

- Cada linha de `investment` representa uma compra individual, mesmo quando o usuário compra o mesmo símbolo várias vezes. Guarda preço e quantidade originais, quantidade restante e preço atual opcional; posições totalmente vendidas continuam para preservar o histórico.
- `profit` é gerado como `(current_price - purchase_unit_price) * remaining_quantity`. Sem preço atual, o resultado é `NULL`; quando calculado, representa somente lucro não realizado e não inclui vendas, taxas, impostos ou dividendos.
- A tabela SQL `"transaction"` registra eventos `BUY` e `SELL` com quantidade, preço unitário, horário de execução e taxa como snapshots históricos. Uma venda que use ações de várias compras precisa de uma linha por compra.
- A quantidade restante e os eventos não são sincronizados automaticamente: o esquema não impede overselling agregado nem garante que os dois registros concordem. Uma futura lógica de escrita deverá atualizá-los atomicamente.
- Não há serviço de cálculo, atualização de cotações, integração com provedor de mercado, dividendos, telas ou endpoints financeiros nesta etapa.

## Fluxos de caixa e metas

- `cash_flow` representa ocorrências reais. `amount` é sempre positivo e `direction` (`IN`/`OUT`) informa se o dinheiro entrou ou saiu. Saídas exigem classificação `FIXED` ou `VARIABLE`; entradas podem omiti-la. Descrição e categoria são opcionais.
- Não há recorrência nem agenda de pagamentos: um fluxo armazenado representa somente um evento ocorrido.
- `goal` mantém os campos atuais, exige proprietário e valida valores e datas; não há ligação automática entre metas e investimentos.

## Compatibilidade e limites

- A migration V1 usa recursos de PostgreSQL 18, incluindo `uuidv7()`. Ela foi preparada para banco novo. Se V1 já foi aplicada, não a altere em um banco existente: crie uma migration posterior para transformar os dados. Só recrie um banco comprovadamente descartável; o Flyway detecta mudanças no checksum.
- Desativar uma conta impede novos logins, mas não revoga tokens JWT stateless já emitidos. A autorização por proprietário dos endpoints legados restantes continua sendo um risco separado.
- Upload de imagens, integração/atualização de cotações, dividendos, calculadora financeira, endpoints/telas financeiras e agendas recorrentes permanecem fora do escopo atual.
