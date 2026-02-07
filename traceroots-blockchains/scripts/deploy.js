async function main() {
  const TraceRoots = await ethers.getContractFactory("TraceRoots");
  const traceRoots = await TraceRoots.deploy();

  await traceRoots.waitForDeployment();

  console.log("TraceRoots deployed to:", await traceRoots.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
