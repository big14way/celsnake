#!/bin/bash
set -e

source .env

echo "Deploying SnakesGame to Celo Alfajores..."
echo "Deployer: $(cast wallet address --private-key "$DEPLOYER_PRIVATE_KEY")"

# Deploy with explicit gas settings
forge create \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --gas-limit 3000000 \
  --gas-price 5000000000 \
  --legacy \
  --timeout 60 \
  --retries 3 \
  contracts/SnakesGame.sol:SnakesGame

