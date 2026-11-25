ALTER TABLE investment ADD COLUMN investment_type VARCHAR(20) NOT NULL DEFAULT 'LEGACY';
ALTER TABLE investment ADD COLUMN annual_rate NUMERIC(9, 4);
ALTER TABLE investment ADD CONSTRAINT ck_investment_type CHECK (investment_type IN ('FIXED_INCOME', 'VARIABLE_INCOME', 'LEGACY'));
ALTER TABLE investment ADD CONSTRAINT ck_investment_annual_rate CHECK (
    (investment_type = 'FIXED_INCOME' AND annual_rate IS NOT NULL AND annual_rate BETWEEN 0 AND 1000)
    OR (investment_type <> 'FIXED_INCOME' AND annual_rate IS NULL)
);