import type { Eip4361Message, Eip4361VersionType } from "./eip4361-types.js";

const ToEip4361StringVersionMap: Record<Eip4361VersionType, (message: Eip4361Message) => string> = {
  "1": function toEip4361StringV1(message: Eip4361Message): string {
    const headerPrefix = message.scheme ? `${message.scheme}://${message.domain}` : message.domain;
    const header = `${headerPrefix} wants you to sign in with your Ethereum account:`;

    const prefix = [header, message.address].join("\n");

    const uriField = `URI: ${message.uri}`;
    const versionField = `Version: ${message.version}`;
    const chainField = `Chain ID: ` + message.chainId.toString() || "1";
    const nonceField = `Nonce: ${message.nonce}`;
    const issuedAtField = `Issued At: ${message.issuedAt}`;

    const suffixArray = [uriField, versionField, chainField, nonceField, issuedAtField];

    if (message.expirationTime) {
      suffixArray.push(`Expiration Time: ${message.expirationTime}`);
    }

    if (message.notBefore) {
      suffixArray.push(`Not Before: ${message.notBefore}`);
    }

    if (message.requestId) {
      suffixArray.push(`Request ID: ${message.requestId}`);
    }

    if (message.resources) {
      suffixArray.push([`Resources:`, ...message.resources.map((x) => `- ${x}`)].join("\n"));
    }

    const suffix = suffixArray.join("\n");

    return message.statement
      ? [prefix, message.statement, suffix].join("\n\n")
      : [prefix, suffix].join("\n");
  },
};

export function toEip4361String(message: Eip4361Message): string {
  return ToEip4361StringVersionMap[message.version](message);
}
