CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL UNIQUE,
  decimals INTEGER DEFAULT 18,
  chain_id INTEGER DEFAULT 80069,
  logo_uri TEXT,
  is_verified BOOLEAN DEFAULT false,
	coingecko_id TEXT,
  source TEXT DEFAULT 'github', -- 'github' ou 'blockchain'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tokens_network ON tokens(chain_id);
CREATE INDEX idx_tokens_address ON tokens(address);
