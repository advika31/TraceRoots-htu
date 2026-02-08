# TraceRoots Solana Program

Anchor program for tracking agricultural batches on Solana, matching the TraceRoots Ethereum contract.

## Prerequisites

1. **Rust** – [rustup](https://rustup.rs/)
2. **Solana CLI** – `sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"`
3. **Anchor CLI** – `cargo install --git https://github.com/coral-xyz/anchor avm --locked && avm install latest && avm use latest`
4. **Node.js** – for tests

## Setup

```bash
cd traceroots-solana
yarn install
```

## Build

```bash
anchor build
```

After the first build, update `declare_id!` in `programs/traceroots/src/lib.rs` and the program IDs in `Anchor.toml` with the program ID shown in the build output.

## Test

```bash
anchor test
```

## Deploy

**Localnet:**
```bash
solana-test-validator   # in one terminal
anchor deploy --provider.cluster localnet
```

**Devnet:**
```bash
solana config set --url devnet
anchor deploy --provider.cluster devnet
```

## Program Overview

- **create_batch** – Creates a new batch with `batch_id`, `crop_type`, `origin_hash`, and `expiry_date`
- **get_batch** – Read-only instruction; clients fetch batch data via the PDA

### PDA Derivation

Batches are stored as PDAs:
```text
seeds = ["batch", batch_id.as_bytes()]
```

To derive the batch account address (e.g., in JS/TS):
```js
const [batchPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("batch"), Buffer.from(batchId)],
  programId
);
```

## BatchData Schema

| Field        | Type       |
|-------------|------------|
| batch_id    | String (max 64) |
| crop_type   | String (max 64) |
| origin_hash | [u8; 32]   |
| expiry_date | i64        |
| timestamp   | i64        |
| authority   | Pubkey     |
