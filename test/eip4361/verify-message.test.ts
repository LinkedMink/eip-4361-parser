import { beforeAll, describe, expect, jest, afterAll, test } from "@jest/globals";
import type { Eip4361Message, VerifyEip4361Params } from "../../src/eip4361/eip4361-types.js";
import {
  Eip4361VerifyDomainError,
  Eip4361VerifyExpiredError,
  Eip4361VerifyNonceError,
  Eip4361VerifyNotBeforeError,
} from "../../src/eip4361/errors.js";

interface ContractInstance {
  isValidSignature: jest.Mock<string>;
}

type MockedEthers = {
  ethers: {
    verifyMessage: jest.Mock<string>;
    hashMessage: jest.Mock<string>;
  };
  Contract: new (address: string, abi: string[], provider?: unknown) => ContractInstance;
};

function buildBaseMessage(overrides?: Partial<Eip4361Message>): Eip4361Message {
  return {
    scheme: "https",
    domain: "example.com",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    uri: "https://example.com/login",
    version: "1" as const,
    chainId: 1,
    nonce: "ABCDEFGH",
    issuedAt: new Date().toISOString(),
    ...overrides,
  };
}

async function loadModule(): Promise<{
  verifyEip4361Message: typeof import("../../src/eip4361/verify-message.js").verifyEip4361Message;
  mockedEthers: MockedEthers;
}> {
  jest.resetModules();
  const verifyMessage = jest.fn<string>();
  const hashMessage = jest.fn<string>((msg: string) => `hash-of-${msg}`);

  const mockContractInstance: ContractInstance = {
    isValidSignature: jest.fn<string>(),
  };

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class -- required for constructor mocking
  class ContractMock {
    constructor(_address: string, _abi: string[], _provider?: unknown) {
      return mockContractInstance;
    }
  }

  jest.doMock("ethers", () => ({
    ethers: {
      verifyMessage,
      hashMessage,
    },
    Contract: ContractMock,
  }));

  const { verifyEip4361Message } = await import("../../src/eip4361/verify-message.js");
  const mockedEthers: MockedEthers = {
    ethers: { verifyMessage, hashMessage },
    Contract: ContractMock,
  };
  return { verifyEip4361Message, mockedEthers };
}

describe("verify-message", () => {
  let verifyEip4361Message: typeof import("../../src/eip4361/verify-message.js").verifyEip4361Message;
  let mockedEthers: MockedEthers;
  let mockContractInstance: ContractInstance;

  beforeAll(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));

    const { verifyEip4361Message: vem, mockedEthers: me } = await loadModule();
    verifyEip4361Message = vem;
    mockedEthers = me;
    mockContractInstance = new me.Contract("", []);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- jest type resolution limitation with Jest 30
  beforeEach(() => {
    mockedEthers.ethers.verifyMessage.mockClear();
    mockedEthers.ethers.hashMessage.mockClear();
    mockContractInstance.isValidSignature.mockClear();
  });

  test("should resolve successfully when signature matches address", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage();
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
      scheme: "https",
      domain: "example.com",
      nonce: "ABCDEFGH",
    };

    await expect(verifyEip4361Message(message, params)).resolves.toBeUndefined();
  });

  test("should resolve successfully when scheme is not provided in params", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage();
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
      domain: "example.com",
      nonce: "ABCDEFGH",
    };

    await expect(verifyEip4361Message(message, params)).resolves.toBeUndefined();
  });

  test("should throw Eip4361VerifySchemeError when scheme does not match", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ scheme: "https" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
      scheme: "http",
      domain: "example.com",
      nonce: "ABCDEFGH",
    };

    await expect(verifyEip4361Message(message, params)).rejects.toThrow("Scheme does not match");
  });

  test("should throw Eip4361VerifyDomainError when domain does not match", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ domain: "example.com" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
      domain: "malicious.com",
      nonce: "ABCDEFGH",
    };

    await expect(verifyEip4361Message(message, params)).rejects.toThrow("Domain does not match");
  });

  test("should throw Eip4361VerifyNonceError when nonce does not match", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ nonce: "ABCDEFGH" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
      nonce: "wrongnonce",
    };

    await expect(verifyEip4361Message(message, params)).rejects.toThrow("Nonce does not match");
  });

  test("should throw Eip4361VerifyExpiredError when message is expired", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ expirationTime: "2024-01-01T00:00:00Z" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).rejects.toThrow("Expired");
  });

  test("should throw Eip4361VerifyNotBeforeError when message is not yet valid", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ notBefore: "2025-01-01T00:00:00Z" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).rejects.toThrow("not valid yet");
  });

  test("should throw Eip4361VerifySignatureError when signature does not match address", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0x000000000000000000000000000000000000dead");
    mockContractInstance.isValidSignature.mockReturnValue("0x00000000");
    const message = buildBaseMessage();
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).rejects.toThrow("Signature does not match");
  });

  test("should resolve successfully when EIP-1271 contract returns magic value", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0x000000000000000000000000000000000000dead");
    mockContractInstance.isValidSignature.mockReturnValue("0x1626ba7e");
    const message = buildBaseMessage();
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).resolves.toBeUndefined();
  });

  test("should throw Eip4361VerifyExpiredError with correct dates when expired", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ expirationTime: "2024-01-01T00:00:00Z" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    try {
      await verifyEip4361Message(message, params);
      expect(true, "Expected to throw").toBe(false);
    } catch (error) {
      expect((error as Eip4361VerifyExpiredError).expirationTime).toStrictEqual(
        new Date("2024-01-01T00:00:00Z"),
      );
    }
  });

  test("should throw Eip4361VerifyNotBeforeError with correct dates when not yet valid", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ notBefore: "2025-01-01T00:00:00Z" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    try {
      await verifyEip4361Message(message, params);
      expect(true, "Expected to throw").toBe(false);
    } catch (error) {
      expect((error as Eip4361VerifyNotBeforeError).notBefore).toStrictEqual(
        new Date("2025-01-01T00:00:00Z"),
      );
    }
  });

  test("should throw Eip4361VerifyDomainError with correct expected and received values", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ domain: "example.com" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
      domain: "malicious.com",
    };

    try {
      await verifyEip4361Message(message, params);
      expect(true, "Expected to throw").toBe(false);
    } catch (error) {
      const domainError = error as Eip4361VerifyDomainError;
      expect(domainError.expected).toBe("malicious.com");
      expect(domainError.received).toBe("example.com");
    }
  });

  test("should throw Eip4361VerifyNonceError with correct expected and received values", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ nonce: "ABCDEFGH" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
      nonce: "wrongnonce",
    };

    try {
      await verifyEip4361Message(message, params);
      expect(true, "Expected to throw").toBe(false);
    } catch (error) {
      const nonceError = error as Eip4361VerifyNonceError;
      expect(nonceError.expected).toBe("wrongnonce");
      expect(nonceError.received).toBe("ABCDEFGH");
    }
  });

  test("should not verify scheme when scheme is not provided in params", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ scheme: "https" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).resolves.toBeUndefined();
  });

  test("should not verify domain when domain is not provided in params", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ domain: "example.com" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).resolves.toBeUndefined();
  });

  test("should not verify nonce when nonce is not provided in params", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ nonce: "ABCDEFGH" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).resolves.toBeUndefined();
  });

  test("should not throw expired error when expirationTime is in the future", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ expirationTime: "2025-12-31T23:59:59Z" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).resolves.toBeUndefined();
  });

  test("should not throw notBefore error when notBefore is in the past", async () => {
    mockedEthers.ethers.verifyMessage.mockReturnValue("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    const message = buildBaseMessage({ notBefore: "2024-01-01T00:00:00Z" });
    const params: VerifyEip4361Params = {
      signature: "0xsignature123",
    };

    await expect(verifyEip4361Message(message, params)).resolves.toBeUndefined();
  });
});
