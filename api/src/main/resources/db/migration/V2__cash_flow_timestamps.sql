-- A entidade CashFlow usa created_at/updated_at, mas a V1 nao criava essas colunas
-- em cash_flow. IF NOT EXISTS mantem a migracao segura em bancos que ja as tenham.
ALTER TABLE cash_flow
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
