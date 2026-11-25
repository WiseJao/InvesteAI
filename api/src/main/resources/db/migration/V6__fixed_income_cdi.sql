ALTER TABLE investment
    ADD COLUMN fixed_product VARCHAR(16),
    ADD COLUMN institution VARCHAR(100),
    ADD COLUMN cdi_percentage NUMERIC(9,4),
    ADD COLUMN maturity_date DATE;

ALTER TABLE investment DROP CONSTRAINT ck_investment_annual_rate;
ALTER TABLE investment ADD CONSTRAINT ck_investment_fixed_terms CHECK (
    (investment_type = 'FIXED_INCOME'
        AND (fixed_product IS NULL OR fixed_product IN ('CDB', 'CAIXINHA', 'OTHER'))
        AND (maturity_date IS NULL OR maturity_date >= purchase_date)
        AND ((annual_rate IS NOT NULL AND annual_rate BETWEEN 0 AND 1000 AND cdi_percentage IS NULL)
          OR (cdi_percentage IS NOT NULL AND cdi_percentage > 0 AND cdi_percentage <= 1000 AND annual_rate IS NULL)))
    OR (investment_type <> 'FIXED_INCOME' AND annual_rate IS NULL AND cdi_percentage IS NULL
        AND fixed_product IS NULL AND institution IS NULL AND maturity_date IS NULL)
);

CREATE TABLE cdi_daily_rate (rate_date DATE PRIMARY KEY, rate NUMERIC(16,10) NOT NULL);
CREATE TABLE cdi_coverage (year INTEGER PRIMARY KEY, covered_through DATE NOT NULL);
