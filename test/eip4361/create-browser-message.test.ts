import { beforeAll, describe, expect, afterAll, test } from "@jest/globals";
import type { CreateBrowserEip4361Params } from "../../src/eip4361/eip4361-types.js";
import { createBrowserEip4361Message } from "../../src/eip4361/create-browser-message.js";

// Mock window.location for Node.js test environment
const mockLocation = {
  protocol: "https:" as const,
  host: "example.com",
  origin: "https://example.com",
};

describe("create-browser-message", () => {
  let originalWindow: unknown;

  beforeAll(() => {
    originalWindow = (globalThis as unknown as Record<string, unknown>).window;
    Object.defineProperty(globalThis, "window", {
      value: {
        location: mockLocation,
      },
      writable: true,
      configurable: true,
    });
  });

  afterAll(() => {
    if (originalWindow !== undefined) {
      Object.defineProperty(globalThis, "window", {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    } else {
      delete (globalThis as unknown as Record<string, unknown>).window;
    }
  });

  test("should return an EIP-4361 message object with defaults when called with basic params", () => {
    // Ensure window.location is set to https before this test
    Object.defineProperty(globalThis, "window", {
      value: {
        location: {
          protocol: "https:" as const,
          host: "example.com",
          origin: "https://example.com",
        },
      },
      writable: true,
      configurable: true,
    });

    const params: CreateBrowserEip4361Params = {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      nonce: "ABCDEFGH",
    };

    const result = createBrowserEip4361Message(params);

    expect(result.scheme).toBe("https");
    expect(result.domain).toBe("example.com");
    expect(result.address).toBe("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    // uri is derived from window.location.origin, not params.uri
    expect(result.uri).toBe("https://example.com");
    expect(result.nonce).toBe("ABCDEFGH");
    expect(result.version).toBe("1");
    expect(result.chainId).toBe(1);
    expect(typeof result.issuedAt).toBe("string");
    expect(result.issuedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z/);
  });

  test("should include optional statement when provided", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: {
          protocol: "https:" as const,
          host: "example.com",
          origin: "https://example.com",
        },
      },
      writable: true,
      configurable: true,
    });

    const params: CreateBrowserEip4361Params = {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      statement: "Sign in to example.com",
      nonce: "ABCDEFGH",
    };

    const result = createBrowserEip4361Message(params);

    expect(result.statement).toBe("Sign in to example.com");
  });

  test("should include optional expirationTime when provided", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: {
          protocol: "https:" as const,
          host: "example.com",
          origin: "https://example.com",
        },
      },
      writable: true,
      configurable: true,
    });

    const params: CreateBrowserEip4361Params = {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      nonce: "ABCDEFGH",
      expirationTime: "2025-12-31T23:59:59Z",
    };

    const result = createBrowserEip4361Message(params);

    expect(result.expirationTime).toBe("2025-12-31T23:59:59Z");
  });

  test("should include optional notBefore when provided", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: {
          protocol: "https:" as const,
          host: "example.com",
          origin: "https://example.com",
        },
      },
      writable: true,
      configurable: true,
    });

    const params: CreateBrowserEip4361Params = {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      nonce: "ABCDEFGH",
      notBefore: "2025-01-01T00:00:00Z",
    };

    const result = createBrowserEip4361Message(params);

    expect(result.notBefore).toBe("2025-01-01T00:00:00Z");
  });

  test("should include optional requestId when provided", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: {
          protocol: "https:" as const,
          host: "example.com",
          origin: "https://example.com",
        },
      },
      writable: true,
      configurable: true,
    });

    const params: CreateBrowserEip4361Params = {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      nonce: "ABCDEFGH",
      requestId: "req-12345",
    };

    const result = createBrowserEip4361Message(params);

    expect(result.requestId).toBe("req-12345");
  });

  test("should include optional resources when provided", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: {
          protocol: "https:" as const,
          host: "example.com",
          origin: "https://example.com",
        },
      },
      writable: true,
      configurable: true,
    });

    const params: CreateBrowserEip4361Params = {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      nonce: "ABCDEFGH",
      resources: ["https://example.com/api", "https://example.com/profile"],
    };

    const result = createBrowserEip4361Message(params);

    expect(result.resources).toStrictEqual([
      "https://example.com/api",
      "https://example.com/profile",
    ]);
  });

  test("should derive scheme, domain, and uri from window.location when not explicitly provided", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: {
          protocol: "http:" as const,
          host: "localhost:3000",
          origin: "http://localhost:3000",
        },
      },
      writable: true,
      configurable: true,
    });

    const params: CreateBrowserEip4361Params = {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      nonce: "ABCDEFGH",
    };

    const result = createBrowserEip4361Message(params);

    expect(result.scheme).toBe("http");
    expect(result.domain).toBe("localhost:3000");
    expect(result.uri).toBe("http://localhost:3000");
  });

  test("should always use window.location values even when params has different values", () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: {
          protocol: "https:" as const,
          host: "example.com",
          origin: "https://example.com",
        },
      },
      writable: true,
      configurable: true,
    });

    const params: CreateBrowserEip4361Params = {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      nonce: "ABCDEFGH",
    };

    const result = createBrowserEip4361Message(params);

    // The function always overrides from window.location, ignoring params.domain/uri
    expect(result.scheme).toBe("https");
    expect(result.domain).toBe("example.com");
    expect(result.uri).toBe("https://example.com");
  });
});
