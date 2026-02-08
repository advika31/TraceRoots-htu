import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Traceroots } from "../target/types/traceroots";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("traceroots", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Traceroots as Program<Traceroots>;

  const batchId = "BATCH-001";
  const cropType = "Wheat";
  const originHash = Buffer.alloc(32, 1); // 32-byte hash
  const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year from now

  let batchPda: PublicKey;
  let bump: number;

  before(async () => {
    [batchPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("batch"), Buffer.from(batchId)],
      program.programId
    );
  });

  it("Creates a batch", async () => {
    await program.methods
      .createBatch(batchId, cropType, Array.from(originHash), new anchor.BN(expiryDate))
      .accounts({
        batch: batchPda,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const batchAccount = await program.account.batchData.fetch(batchPda);

    expect(batchAccount.batchId).to.equal(batchId);
    expect(batchAccount.cropType).to.equal(cropType);
    expect(Buffer.from(batchAccount.originHash)).to.deep.equal(originHash);
    expect(batchAccount.expiryDate.toNumber()).to.equal(expiryDate);
    expect(batchAccount.timestamp.toNumber()).to.be.greaterThan(0);
  });

  it("Fetches batch via get_batch", async () => {
    await program.methods
      .getBatch(batchId)
      .accounts({
        batch: batchPda,
      })
      .rpc();

    const batchAccount = await program.account.batchData.fetch(batchPda);
    expect(batchAccount.batchId).to.equal(batchId);
  });
});
