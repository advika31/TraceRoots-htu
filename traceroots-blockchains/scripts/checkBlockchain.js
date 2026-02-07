async function main() {
  // 🔴 PASTE your deployed contract address here
  const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const TraceRoots = await ethers.getContractFactory("TraceRoots");
  const contract = TraceRoots.attach(CONTRACT_ADDRESS);

  console.log("🔗 Connected to TraceRoots contract");

  // ---------------------------
  // HARD-CODED TEST DATA
  // ---------------------------
  const batchId = "TEST_BATCH_01";
  const cropType = "Organic Wheat";

  // Valid 32-byte dummy hash
  const originHash =
    "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

  // Expiry: 5 days from now
  const expiryDate =
    Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60;

  // ---------------------------
  // WRITE TO BLOCKCHAIN
  // ---------------------------
  console.log("⏳ Writing data to blockchain...");

  const tx = await contract.createBatch(
    batchId,
    cropType,
    originHash,
    expiryDate
  );

  const receipt = await tx.wait();

  console.log("✅ Data written successfully");
  console.log("   TX Hash:", tx.hash);
  console.log("   Gas Used:", receipt.gasUsed.toString());

  // ---------------------------
  // READ FROM BLOCKCHAIN
  // ---------------------------
  console.log("\n🔍 Reading data from blockchain...");

  const data = await contract.getBatch(batchId);

  console.log("📦 Data fetched from chain:");
  console.log({
    batchId: data[0],
    cropType: data[1],
    originHash: data[2],
    expiryDate: data[3].toString(),
    timestamp: data[4].toString()
  });

  console.log("\n🎉 Blockchain read/write verified!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exitCode = 1;
});
