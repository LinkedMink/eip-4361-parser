import type { ParseResult } from "apg-lite";

export class Eip4361Error extends Error {}

export class Eip4361ParseError extends Eip4361Error {
  constructor(public readonly result: ParseResult) {
    super("Invalid EIP-4361 message");
  }
}

export class Eip4361ValidationError extends Eip4361Error {}

/** `expirationTime` is present and in the past. */
export class Eip4361VerifyExpiredError extends Eip4361ValidationError {
  constructor(
    public readonly expirationTime: Date,
    public readonly currentDateTime: Date,
  ) {
    super("Expired message.");
  }
}

/** `notBefore` is present and in the future. */
export class Eip4361VerifyNotBeforeError extends Eip4361ValidationError {
  constructor(
    public readonly notBefore: Date,
    public readonly currentDateTime: Date,
  ) {
    super("Message is not valid yet.");
  }
}

export class Eip4361VerifySchemeError extends Eip4361ValidationError {
  constructor(
    public readonly expected: string,
    public readonly received?: string,
  ) {
    super("Scheme does not match provided scheme for verification.");
  }
}

export class Eip4361VerifyDomainError extends Eip4361ValidationError {
  constructor(
    public readonly expected: string,
    public readonly received: string,
  ) {
    super("Domain does not match provided domain for verification.");
  }
}

export class Eip4361VerifyNonceError extends Eip4361ValidationError {
  constructor(
    public readonly expected: string,
    public readonly received: string,
  ) {
    super("Nonce does not match provided nonce for verification.");
  }
}

/** Signature doesn't match the address of the message. */
export class Eip4361VerifySignatureError extends Eip4361ValidationError {
  constructor(
    public readonly address: string,
    public readonly signature: string,
  ) {
    super("Signature does not match address of the message.");
  }
}
