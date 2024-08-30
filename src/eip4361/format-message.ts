import type { Eip4361Message } from "./eip4361-types.js";

function toEip4361StringV1(message: Eip4361Message): string {
  const headerPrefix = message.scheme ? `${message.scheme}://${message.domain}` : message.domain;
  const header = `${headerPrefix} wants you to sign in with your Ethereum account:`;
  const uriField = `URI: ${message.uri}`;
  let prefix = [header, message.address].join("\n");
  const versionField = `Version: ${message.version}`;

  const chainField = `Chain ID: ` + message.chainId.toString() || "1";

  const nonceField = `Nonce: ${message.nonce}`;

  const suffixArray = [uriField, versionField, chainField, nonceField];

  message.issuedAt = message.issuedAt || new Date().toISOString();

  suffixArray.push(`Issued At: ${message.issuedAt}`);

  if (message.expirationTime) {
    const expiryField = `Expiration Time: ${message.expirationTime}`;

    suffixArray.push(expiryField);
  }

  if (message.notBefore) {
    suffixArray.push(`Not Before: ${message.notBefore}`);
  }

  if (message.requestId) {
    suffixArray.push(`Request ID: ${message.requestId}`);
  }

  if (message.resources) {
    suffixArray.push([`Resources:`, ...message.resources.map(x => `- ${x}`)].join("\n"));
  }

  const suffix = suffixArray.join("\n");
  prefix = [prefix, message.statement].join("\n\n");
  if (message.statement) {
    prefix += "\n";
  }
  return [prefix, suffix].join("\n");
}

export function toEip4361String(message: Eip4361Message): string {
  switch (message.version) {
    case "1": {
      return toEip4361StringV1(message);
    }

    default: {
      return toEip4361StringV1(message);
    }
  }
}
