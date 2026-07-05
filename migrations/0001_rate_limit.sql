CREATE TABLE IF NOT EXISTS usage_limits (
  key TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, usage_date)
);

CREATE INDEX IF NOT EXISTS usage_limits_date_idx
  ON usage_limits (usage_date);
