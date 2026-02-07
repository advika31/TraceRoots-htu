# /backend/utils/blockchain_utils.py

import os
import json
from web3 import Web3
from eth_account import Account  # ensures keccak available via web3


GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:7545")
BUILD_JSON = os.path.join("build", "BatchRegistry.json")
ADDRESS_PATH = os.path.join("build", "BatchRegistry.address")


def _get_w3() -> Web3:
    w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
    if not w3.is_connected():
        raise RuntimeError("Cannot connect to Ganache at " + GANACHE_URL)
    return w3


def _get_contract(w3: Web3):
    if not os.path.exists(BUILD_JSON) or not os.path.exists(ADDRESS_PATH):
        raise RuntimeError("Contract not compiled/deployed. Run compile and deploy scripts.")
    with open(BUILD_JSON, "r", encoding="utf-8") as f:
        compiled = json.load(f)
    with open(ADDRESS_PATH, "r", encoding="utf-8") as f:
        address = f.read().strip()
    return w3.eth.contract(address=address, abi=compiled["abi"])

def register_batch_onchain(batch_id: int, crop_type: str, quantity_kg: float, farmer_wallet: str):
    w3 = _get_w3()
    contract = _get_contract(w3)
    sender = w3.eth.accounts[0]

    tx = contract.functions.registerBatch(
        batch_id,
        crop_type,
        int(quantity_kg)
    ).transact({"from": sender})

    receipt = w3.eth.wait_for_transaction_receipt(tx)
    return receipt.transactionHash.hex()


def verify_batch_onchain(batch_id: int, crop_type: str, quantity_kg: float, farmer_wallet: str) -> bool:
    w3 = _get_w3()
    contract = _get_contract(w3)
    return contract.functions.verifyBatch(
        batch_id,
        crop_type,
        int(quantity_kg),
        farmer_wallet
    ).call()

def mint_tokens(farmer_wallet: str, amount: int):
    """
    Mint ImpactTokens to farmer wallet.
    Assumes ImpactToken contract is deployed.
    """
    w3 = _get_w3()

    # Load ImpactToken contract
    with open("build/ImpactToken.json", "r", encoding="utf-8") as f:
        compiled = json.load(f)

    with open("build/ImpactToken.address", "r", encoding="utf-8") as f:
        address = f.read().strip()

    contract = w3.eth.contract(address=address, abi=compiled["abi"])

    sender = w3.eth.accounts[0]  # deployer / admin
    tx = contract.functions.mint(
        farmer_wallet,
        amount * (10 ** 18)
    ).transact({"from": sender})

    receipt = w3.eth.wait_for_transaction_receipt(tx)
    return receipt.transactionHash.hex()
