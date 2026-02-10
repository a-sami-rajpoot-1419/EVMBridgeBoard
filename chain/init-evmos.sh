#!/bin/sh
set -e

CHAIN_ID="evmbridge_9000-1"
MONIKER="evmbridge-node"
KEY="validator"
DENOM="stake"

if [ ! -f /home/evmos/.evmosd/config/genesis.json ]; then
  echo "Initializing Evmos..."

  evmosd init $MONIKER --chain-id $CHAIN_ID

  evmosd keys add $KEY --keyring-backend test --no-backup

  ADDRESS=$(evmosd keys show $KEY -a --keyring-backend test)

  evmosd add-genesis-account $ADDRESS 1000000000000000000000$DENOM

  evmosd gentx $KEY 1000000000000000000$DENOM \
    --chain-id $CHAIN_ID \
    --keyring-backend test

  evmosd collect-gentxs

  # Fix EVM denomination to use "stake" instead of "aevmos"
  sed -i 's/"evm_denom": "aevmos"/"evm_denom": "stake"/' /home/evmos/.evmosd/config/genesis.json

  echo "Evmos initialized successfully"
fi

sed -i 's/^minimum-gas-prices *=.*/minimum-gas-prices = "0stake"/' \
  /home/evmos/.evmosd/config/app.toml

sed -i 's/^address *= *"tcp:\/\/localhost:1317"/address = "tcp:\/\/0.0.0.0:1317"/' \
  /home/evmos/.evmosd/config/app.toml

echo "Starting Evmos..."
exec evmosd start \
  --rpc.laddr=tcp://0.0.0.0:26657 \
  --rpc.unsafe \
  --json-rpc.enable \
  --json-rpc.address=0.0.0.0:8545 \
  --json-rpc.ws-address=0.0.0.0:8546 \
  --json-rpc.api eth,txpool,net,web3,debug \
  --api.enable
