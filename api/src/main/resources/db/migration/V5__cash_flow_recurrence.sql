CREATE TABLE cash_flow_recurrence (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(19,2) NOT NULL CHECK (amount > 0),
    first_date DATE NOT NULL,
    last_date DATE CHECK (last_date >= first_date),
    next_month DATE NOT NULL,
    ended BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_cash_flow_recurrence_due ON cash_flow_recurrence (next_month, user_id) WHERE NOT ended;
CREATE TABLE cash_flow_occurrence (
    recurrence_id UUID NOT NULL REFERENCES cash_flow_recurrence(id) ON DELETE CASCADE,
    period DATE NOT NULL,
    cash_flow_id UUID UNIQUE REFERENCES cash_flow(cash_flow_id) ON DELETE SET NULL,
    PRIMARY KEY (recurrence_id, period)
);
