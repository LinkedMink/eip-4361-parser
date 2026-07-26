import { describe, expect, test } from "@jest/globals";
import { zodTransformStringToEip4361Message } from "../../src/zod/zod-transform.js";

describe("zodTransformStringToEip4361Message", () => {
  test("should return parsed message when input correctly formatted", () => {
    const input = `https://service.tld wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

service.tld will use your public transactions to verify and create a unique account associated with your Ethereum account

URI: https://service.tld/login
Version: 1
Chain ID: 1
Nonce: 32891756
Issued At: 2021-09-30T16:25:24Z
Resources:
- https://service.tld/api`;

    const result = zodTransformStringToEip4361Message.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scheme).toBe("https");
      expect(result.data.domain).toBe("service.tld");
      expect(result.data.address).toBe("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
      expect(result.data.statement).toBe(
        "service.tld will use your public transactions to verify and create a unique account associated with your Ethereum account",
      );
      expect(result.data.uri).toBe("https://service.tld/login");
      expect(result.data.version).toBe("1");
      expect(result.data.chainId).toBe(1);
      expect(result.data.nonce).toBe("32891756");
      expect(result.data.issuedAt).toBe("2021-09-30T16:25:24Z");
      expect(result.data.resources).toStrictEqual(["https://service.tld/api"]);
    }
  });

  test("should return error when input incorrectly formatted", () => {
    const result = zodTransformStringToEip4361Message.safeParse("Not a EIP-4361 message");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toStrictEqual("custom");
      expect(result.error.issues[0].message).toStrictEqual("Failed to parse EIP-4361 message");
    }
  });

  test("should return error with custom issue code when parse throws", () => {
    const result = zodTransformStringToEip4361Message.safeParse("garbage input");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toStrictEqual("custom");
      expect(result.error.issues[0].message).toStrictEqual("Failed to parse EIP-4361 message");
    }
  });

  test("should return parsed message with all optional fields when provided", () => {
    const input = `https://example.com wants you to sign in with your Ethereum account:
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

    const result = zodTransformStringToEip4361Message.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scheme).toBe("https");
      expect(result.data.domain).toBe("example.com");
      expect(result.data.address).toBe("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
      expect(result.data.statement).toBe("Sign in to example.com");
      expect(result.data.uri).toBe("https://example.com/login");
      expect(result.data.version).toBe("1");
      expect(result.data.chainId).toBe(1);
      expect(result.data.nonce).toBe("ABCDEFGH");
      expect(result.data.issuedAt).toBe("2024-01-01T00:00:00Z");
      expect(result.data.expirationTime).toBe("2025-12-31T23:59:59Z");
      expect(result.data.notBefore).toBe("2025-01-01T00:00:00Z");
      expect(result.data.requestId).toBe("req-123");
      expect(result.data.resources).toStrictEqual([
        "https://example.com/api",
        "https://example.com/profile",
      ]);
    }
  });

  test("should return parsed message without optional fields when not provided", () => {
    const input = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`;

    const result = zodTransformStringToEip4361Message.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scheme).toBe("https");
      expect(result.data.domain).toBe("example.com");
      expect(result.data.address).toBe("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
      expect(result.data.uri).toBe("https://example.com/login");
      expect(result.data.version).toBe("1");
      expect(result.data.chainId).toBe(1);
      expect(result.data.nonce).toBe("ABCDEFGH");
      expect(result.data.issuedAt).toBe("2024-01-01T00:00:00Z");
      expect(result.data.statement).toBeUndefined();
      expect(result.data.expirationTime).toBeUndefined();
      expect(result.data.notBefore).toBeUndefined();
      expect(result.data.requestId).toBeUndefined();
      expect(result.data.resources).toBeUndefined();
    }
  });

  test("should handle empty string input as invalid", () => {
    const result = zodTransformStringToEip4361Message.safeParse("");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toStrictEqual("custom");
      expect(result.error.issues[0].message).toStrictEqual("Failed to parse EIP-4361 message");
    }
  });

  test("should parse message with http scheme", () => {
    const input = `http://localhost:3000 wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: http://localhost:3000/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`;

    const result = zodTransformStringToEip4361Message.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scheme).toBe("http");
      expect(result.data.domain).toBe("localhost:3000");
    }
  });

  test("should parse message with custom chainId", () => {
    const input = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 5
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z`;

    const result = zodTransformStringToEip4361Message.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scheme).toBe("https");
      expect(result.data.chainId).toBe(5);
    }
  });

  test("should return parsed message with resources", () => {
    const input = `https://example.com wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2


URI: https://example.com/login
Version: 1
Chain ID: 1
Nonce: ABCDEFGH
Issued At: 2024-01-01T00:00:00Z
Resources:
- https://example.com/api/v1
- https://example.com/profile`;

    const result = zodTransformStringToEip4361Message.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scheme).toBe("https");
      expect(result.data.resources).toStrictEqual([
        "https://example.com/api/v1",
        "https://example.com/profile",
      ]);
    }
  });
});
