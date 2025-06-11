CREATE TABLE tokens_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  decimals INTEGER DEFAULT 18,
  chain_id INTEGER DEFAULT 80069,
  logo_uri TEXT,
  is_verified BOOLEAN DEFAULT false,
  coingecko_id TEXT,
  source TEXT DEFAULT 'github',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(address, chain_id)
);

INSERT INTO tokens_new (id, symbol, name, address, decimals, chain_id, logo_uri, is_verified, coingecko_id, source, created_at, updated_at)
SELECT id, symbol, name, address, decimals, chain_id, logo_uri, is_verified, coingecko_id, source, created_at, updated_at
FROM tokens;

DROP TABLE tokens;

ALTER TABLE tokens_new RENAME TO tokens;

CREATE INDEX idx_tokens_chain_id ON tokens(chain_id);
CREATE INDEX idx_tokens_address ON tokens(address);
CREATE INDEX idx_tokens_composite ON tokens(address, chain_id);
