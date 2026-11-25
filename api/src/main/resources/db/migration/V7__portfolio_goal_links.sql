ALTER TABLE goal ADD COLUMN progress_mode VARCHAR(12) NOT NULL DEFAULT 'MANUAL'
    CHECK (progress_mode IN ('MANUAL', 'PORTFOLIO'));

CREATE TABLE goal_holding (
    goal_id UUID NOT NULL REFERENCES goal(goal_id) ON DELETE CASCADE,
    investment_id UUID NOT NULL REFERENCES investment(investment_id) ON DELETE CASCADE,
    PRIMARY KEY (goal_id, investment_id)
);
CREATE INDEX idx_goal_holding_investment ON goal_holding (investment_id);
