import { ethers } from "ethers";
import dotenv from "dotenv";
import TraceRootsABI from "./TraceRootsABI.json";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  TraceRootsABI,
  wallet
);

export async function createBatchOnChain({
  batchId,
  cropType,
  originHash,
  expiryDate
}) {
  const tx = await contract.createBatch(
    batchId,
    cropType,
    originHash,
    expiryDate
  );

  await tx.wait(); // wait for mining
  return tx.hash;
}

export async function getBatchFromChain(batchId) {
  return await contract.getBatch(batchId);
}
