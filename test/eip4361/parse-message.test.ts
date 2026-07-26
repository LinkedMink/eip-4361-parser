import { describe, expect, test } from "@jest/globals";
import { parseEip4361Message } from "../../src/eip4361/parse-message.js";
import { Eip4361ParseError } from "../../src/eip4361/errors.js";

describe("parse-message", () => {
  test("should parse a valid EIP-4361 message with all fields when provided", () => {
    const message = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

Sign in to example.com

URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z
Expiration Time: 2025-12-31T23:59:59Z
Not Before: 2025-01-01T00:00:00Z
Request ID: req-123
Resources:
- https://example.com/api
- https://example.com/profile`;

    const result = parseEip4361Message(message);

    expect(result).toStrictEqual({
      scheme: "https",
      domain: "example.com",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      statement: "Sign in to example.com",
      uri: "https://example.com/login",
      version: "1",
      chainId: 1,
      nonce: "ABCDEFGH",
      issuedAt: "2024-01-01T00:00:00Z",
      expirationTime: "2025-12-31T23:59:59Z",
      notBefore: "2025-01-01T00:00:00Z",
      requestId: "req-123",
      resources: ["https://example.com/api", "https://example.com/profile"],
    });
  });

  test("should parse a valid EIP-4361 message without optional fields", () => {
    const message = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: 12345678
Issued At: 2024-01-01T00:00:00Z`;

    const result = parseEip4361Message(message);

    expect(result.scheme).toBe("https");
    expect(result.domain).toBe("example.com");
    expect(result.address).toBe("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    expect(result.uri).toBe("https://example.com/login");
    expect(result.version).toBe("1");
    expect(result.chainId).toBe(1);
    expect(result.nonce).toBe("12345678");
    expect(result.issuedAt).toBe("2024-01-01T00:00:00Z");
    expect(result.expirationTime).toBeUndefined();
    expect(result.notBefore).toBeUndefined();
    expect(result.requestId).toBeUndefined();
    expect(result.resources).toBeUndefined();
  });

  test("should parse a valid EIP-4361 message without statement", () => {
    const message = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`;

    const result = parseEip4361Message(message);

    expect(result.statement).toBeUndefined();
  });

  test("should parse a valid EIP-4361 message with resources", () => {
    const message = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z
Resources:
- https://example.com/api/v1
- https://example.com/profile
- https://example.com/data`;

    const result = parseEip4361Message(message);

    expect(result.resources).toStrictEqual([
      "https://example.com/api/v1",
      "https://example.com/profile",
      "https://example.com/data",
    ]);
  });

  test("should parse a valid EIP-4361 message with http scheme", () => {
    const message = `http://localhost:3000 wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: http://localhost:3000/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`;

    const result = parseEip4361Message(message);

    expect(result.scheme).toBe("http");
    expect(result.domain).toBe("localhost:3000");
  });

  test("should parse a valid EIP-4361 message with custom chainId", () => {
    const message = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 5
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`;

    const result = parseEip4361Message(message);

    expect(result.chainId).toBe(5);
  });

  test("should throw Eip4361ParseError when message is invalid", () => {
    const invalidMessage = "This is not a valid EIP-4361 message";

    expect(() => parseEip4361Message(invalidMessage)).toThrow(Eip4361ParseError);
  });

  test("should throw Eip4361ParseError when message is empty", () => {
    expect(() => parseEip4361Message("")).toThrow(Eip4361ParseError);
  });

  test("should throw Eip4361ParseError when message has missing required fields", () => {
    const invalidMessage = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH`;

    expect(() => parseEip4361Message(invalidMessage)).toThrow(Eip4361ParseError);
  });

  test("should parse a valid EIP-4361 message with only required fields and no statement", () => {
    const message = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`;

    const result = parseEip4361Message(message);

    expect(result.scheme).toBe("https");
    expect(result.domain).toBe("example.com");
    expect(result.address).toBe("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    expect(result.uri).toBe("https://example.com/login");
    expect(result.version).toBe("1");
    expect(result.chainId).toBe(1);
    expect(result.nonce).toBe("ABCDEFGH");
    expect(result.issuedAt).toBe("2024-01-01T00:00:00Z");
  });

  test("should parse a valid EIP-4361 message with expirationTime and notBefore", () => {
    const message = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z
Expiration Time: 2025-12-31T23:59:59Z
Not Before: 2025-01-01T00:00:00Z`;

    const result = parseEip4361Message(message);

    expect(result.expirationTime).toBe("2025-12-31T23:59:59Z");
    expect(result.notBefore).toBe("2025-01-01T00:00:00Z");
  });

  test("should parse a valid EIP-4361 message with statement", () => {
    const message = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

Please sign in to access your account.

URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`;

    const result = parseEip4361Message(message);

    expect(result.statement).toBe("Please sign in to access your account.");
  });
});
