# TraceRoots Smart Contract

TraceRoots contract for on-chain batch registration and verification. Used by the TraceRoots backend and frontend.

## Contract

- **TraceRoots.sol**: Stores batch records (batchId, cropType, originHash, expiryDate). `createBatch` and `getBatch`.

## Deploy (local)

```bash
npm install
npx hardhat compile
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

Copy the printed contract address into the **backend** `.env` as `CONTRACT_ADDRESS`, and set `RPC_URL=http://127.0.0.1:8545` and `PRIVATE_KEY` to the first Hardhat test account private key (from the `npx hardhat node` output).

## Backend integration

The main TraceRoots **backend** (Python/FastAPI) talks to this contract via `backend/utils/blockchain_utils.py` using:

- `backend/blockchain/TraceRootsABI.json` (keep in sync with compiled ABI if you change the contract)
- Env: `RPC_URL`, `CONTRACT_ADDRESS`, `PRIVATE_KEY`

After changing the contract, copy the new ABI from `artifacts/contracts/TraceRoots.sol/TraceRoots.json` (key `abi`) into `backend/blockchain/TraceRootsABI.json`.

## Tasks

```bash
npx hardhat help
npx hardhat test
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```
