import { keccak256, stringToBytes, toHex } from "viem";

// EIP-1967 slots are defined as:
// bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
// bytes32(uint256(keccak256('eip1967.proxy.admin')) - 1)

// Resolves to:
// 0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC
export const IMPLEMENTATION_SLOT = (() => {
  const hash = keccak256(stringToBytes("eip1967.proxy.implementation"));
  return toHex(BigInt(hash) - 1n);
})();

// Resolves to:
// 0xb53127684a568b3173ae13b9f8a6016e01ffb3c1b2c0cfb9b1b3b47b4d5d1df7
export const ADMIN_SLOT = (() => {
  const hash = keccak256(stringToBytes("eip1967.proxy.admin"));
  return toHex(BigInt(hash) - 1n);
})();

