import { Eip4361Version } from "./constants.js";
import type { CreateEip4361Params, Eip4361Message } from "./eip4361-types.js";

const NONCE_BYTES = 12;

/**
 * @see https://chainid.network/
 */
enum ChainId {
  EthereumMainnet = 1,
}

/**
 * This method leverages a native CSPRNG with support for both browser and Node.js
 * environments in order generate a cryptographically secure nonce for use in the
 * SiweMessage in order to prevent replay attacks.
 *
 * 96 bits has been chosen as a number to sufficiently balance size and security considerations
 * relative to the lifespan of it's usage.
 *
 * @returns cryptographically generated random nonce with 96 bits of entropy encoded with
 * an alphanumeric character set.
 */
export function createNonce(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  return Array.prototype.map
    .call(randomBytes, (x: number) => x.toString(16).padStart(2, "0"))
    .join("");
}

export function createEip4361Message(params: CreateEip4361Params): Eip4361Message {
  return {
    ...params,
    version: Eip4361Version,
    chainId: ChainId.EthereumMainnet,
    issuedAt: new Date().toISOString(),
  };
}
