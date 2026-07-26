import { describe, expect, test } from "@jest/globals";
import type { Eip4361Message } from "../../src/eip4361/eip4361-types.js";
import { toEip4361String } from "../../src/eip4361/format-message.js";

function buildBaseMessage(overrides?: Partial<Eip4361Message>): Eip4361Message {
  return {
    scheme: "https",
    domain: "example.com",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    uri: "https://example.com/login",
    version: "1" as const,
    chainId: 1,
    nonce: "ABCDEFGH",
    issuedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("format-message", () => {
  test("should return formatted EIP-4361 string with all fields when provided", () => {
    const message = buildBaseMessage({
      statement: "Sign in to example.com",
      expirationTime: "2025-12-31T23:59:59Z",
      notBefore: "2025-01-01T00:00:00Z",
      requestId: "req-123",
      resources: ["https://example.com/api", "https://example.com/profile"],
    });

    const result = toEip4361String(message);

    expect(result).toBe(`https://example.com wants you to sign in with your Ethereum account:
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
- https://example.com/profile`);
  });

  test("should return formatted EIP-4361 string without statement when not provided", () => {
    const message = buildBaseMessage({
      statement: undefined,
    });

    const result = toEip4361String(message);

    expect(result).toBe(`https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`);
  });

  test("should omit optional fields when not provided", () => {
    const message = buildBaseMessage({
      expirationTime: undefined,
      notBefore: undefined,
      requestId: undefined,
      resources: undefined,
    });

    const result = toEip4361String(message);

    expect(result).not.toContain("Expiration Time");
    expect(result).not.toContain("Not Before");
    expect(result).not.toContain("Request ID");
    expect(result).not.toContain("Resources");
  });

  test("should use domain-only prefix when scheme is empty string", () => {
    const message = buildBaseMessage({
      scheme: "",
    });

    const result = toEip4361String(message);

    expect(result).toBe(`example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`);
  });

  test("should include only Expiration Time when provided without other optional fields", () => {
    const message = buildBaseMessage({
      expirationTime: "2025-12-31T23:59:59Z",
      notBefore: undefined,
      requestId: undefined,
      resources: undefined,
    });

    const result = toEip4361String(message);

    expect(result).toContain("Expiration Time: 2025-12-31T23:59:59Z");
    expect(result).not.toContain("Not Before");
    expect(result).not.toContain("Request ID");
    expect(result).not.toContain("Resources");
  });

  test("should include only Not Before when provided without other optional fields", () => {
    const message = buildBaseMessage({
      expirationTime: undefined,
      notBefore: "2025-01-01T00:00:00Z",
      requestId: undefined,
      resources: undefined,
    });

    const result = toEip4361String(message);

    expect(result).toContain("Not Before: 2025-01-01T00:00:00Z");
    expect(result).not.toContain("Expiration Time");
    expect(result).not.toContain("Request ID");
    expect(result).not.toContain("Resources");
  });

  test("should include only Request ID when provided without other optional fields", () => {
    const message = buildBaseMessage({
      expirationTime: undefined,
      notBefore: undefined,
      requestId: "req-456",
      resources: undefined,
    });

    const result = toEip4361String(message);

    expect(result).toContain("Request ID: req-456");
    expect(result).not.toContain("Expiration Time");
    expect(result).not.toContain("Not Before");
    expect(result).not.toContain("Resources");
  });

  test("should format resources as bullet list when provided", () => {
    const message = buildBaseMessage({
      resources: ["https://example.com/api/v1", "https://example.com/profile"],
    });

    const result = toEip4361String(message);

    expect(result).toContain(
      "Resources:\n- https://example.com/api/v1\n- https://example.com/profile",
    );
  });

  test("should format message with single resource correctly", () => {
    const message = buildBaseMessage({
      resources: ["https://example.com/api"],
    });

    const result = toEip4361String(message);

    expect(result).toContain("Resources:\n- https://example.com/api");
  });

  test("should use default chainId of 1 when not explicitly set", () => {
    const message = buildBaseMessage({
      chainId: 1,
    });

    const result = toEip4361String(message);

    expect(result).toContain("Chain ID: 1");
  });

  test("should use custom chainId when provided", () => {
    const message = buildBaseMessage({
      chainId: 5,
    });

    const result = toEip4361String(message);

    expect(result).toContain("Chain ID: 5");
  });
});
