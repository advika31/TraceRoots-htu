# backend/utils/blockchain_utils.py
# TraceRoots contract integration (traceroots-blockchains)

import os
import json
from pathlib import Path
from web3 import Web3

# Env: RPC_URL (or GANACHE_URL), PRIVATE_KEY, CONTRACT_ADDRESS
RPC_URL = os.getenv("RPC_URL") or os.getenv("GANACHE_URL", "http://127.0.0.1:7545")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
ABI_PATH = Path(__file__).resolve().parent.parent / "blockchain" / "TraceRootsABI.json"


def _get_w3() -> Web3:
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        raise RuntimeError("Cannot connect to chain at " + RPC_URL)
    return w3


def _get_contract(w3: Web3):
    if not CONTRACT_ADDRESS:
        raise RuntimeError("CONTRACT_ADDRESS not set. Deploy TraceRoots and set env.")
    with open(ABI_PATH, "r", encoding="utf-8") as f:
        abi = json.load(f)
    return w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=abi)


def _origin_hash_to_bytes32(origin_hash_hex: str):
    """Convert DB origin_hash (64-char hex string) to bytes32 for contract."""
    if not origin_hash_hex or len(origin_hash_hex) != 64:
        raise ValueError("origin_hash must be 64-char hex (SHA256)")
    return bytes.fromhex(origin_hash_hex)


def create_batch_onchain(
    batch_id: str,
    crop_type: str,
    origin_hash: str,
    expiry_timestamp: int,
) -> str:
    """
    Register a batch on the TraceRoots contract. Returns transaction hash.
    """
    if not PRIVATE_KEY:
        raise RuntimeError("PRIVATE_KEY not set for blockchain writes")
    w3 = _get_w3()
    contract = _get_contract(w3)
    origin_bytes = _origin_hash_to_bytes32(origin_hash)
    account = w3.eth.account.from_key(PRIVATE_KEY)
    tx = contract.functions.createBatch(
        batch_id,
        crop_type,
        origin_bytes,
        expiry_timestamp,
    ).build_transaction(
        {
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address),
            "gas": 300_000,
        }
    )
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt["transactionHash"].hex()


def get_batch_from_chain(batch_id: str):
    """
    Read batch from TraceRoots contract. Returns dict or None if not found.
    """
    try:
        w3 = _get_w3()
        contract = _get_contract(w3)
        raw = contract.functions.getBatch(batch_id).call()
        return {
            "batchId": raw[0],
            "cropType": raw[1],
            "originHash": raw[2].hex() if hasattr(raw[2], "hex") else raw[2],
            "expiryDate": raw[3],
            "timestamp": raw[4],
        }
    except Exception:
        return None


def is_batch_on_chain(batch_id: str) -> bool:
    """Returns True if batch exists on chain."""
    return get_batch_from_chain(batch_id) is not None
