import { Contract, ethers } from "ethers";
import type { Eip4361Message, VerifyEip4361Opts, VerifyEip4361Params } from "./eip4361-types.js";
import {
  Eip4361VerifyDomainError,
  Eip4361VerifyExpiredError,
  Eip4361VerifyNonceError,
  Eip4361VerifyNotBeforeError,
  Eip4361VerifySchemeError,
  Eip4361VerifySignatureError,
} from "./errors.js";
import { toEip4361String } from "./format-message.js";

function getVerifiedAddress(message: Eip4361Message, signature: string) {
  const eip4361Message = toEip4361String(message);

  /** Recover address from signature */
  try {
    return ethers.verifyMessage(eip4361Message, signature);
  } catch (e) {
    console.error(e);
  }
}

const EIP1271_ABI = [
  "function isValidSignature(bytes32 _message, bytes _signature) public view returns (bytes4)",
];
const EIP1271_MAGIC_VALUE = "0x1626ba7e";

/**
 * Verifies the integrity of the object by matching its signature.
 * @param params Parameters to verify the integrity of the message, signature is required.
 * @returns This object if valid.
 */
export async function verifyEip4361Message(
  message: Eip4361Message,
  params: VerifyEip4361Params,
  opts?: VerifyEip4361Opts,
): Promise<void> {
  const { signature, scheme, domain, nonce } = params;

  if (scheme && scheme !== message.scheme) {
    throw new Eip4361VerifySchemeError(scheme, message.scheme);
  }

  if (domain && domain !== message.domain) {
    throw new Eip4361VerifyDomainError(domain, message.domain);
  }

  if (nonce && nonce !== message.nonce) {
    throw new Eip4361VerifyNonceError(nonce, message.nonce);
  }

  /** Check time or now */
  const currentDateTime = new Date();

  /** Message not expired */
  if (message.expirationTime) {
    const expirationDate = new Date(message.expirationTime);
    if (currentDateTime.getTime() >= expirationDate.getTime()) {
      throw new Eip4361VerifyExpiredError(expirationDate, currentDateTime);
    }
  }

  /** Message is valid already */
  if (message.notBefore) {
    const notBefore = new Date(message.notBefore);
    if (currentDateTime.getTime() < notBefore.getTime()) {
      throw new Eip4361VerifyNotBeforeError(notBefore, currentDateTime);
    }
  }

  const address = getVerifiedAddress(message, signature);

  /** Match signature with message's address */
  if (address !== message.address) {
    const walletContract = new Contract(message.address, EIP1271_ABI, opts?.provider);
    const hashedMessage = ethers.hashMessage(toEip4361String(message));
    const res = (await walletContract.isValidSignature(hashedMessage, signature)) as string;
    if (res !== EIP1271_MAGIC_VALUE) {
      throw new Eip4361VerifySignatureError(message.address, signature);
    }
  }
}
