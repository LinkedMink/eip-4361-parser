import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import { createEip4361Message, createNonce } from "../../src/eip4361/create-message.js";

describe(createNonce.name, () => {
  test("should return randomized value with at least 8 alphanumeric characters when called", () => {
    const result1 = createNonce();
    const result2 = createNonce();
    const result3 = createNonce();

    expect(result1).not.toStrictEqual(result2);
    expect(result2).not.toStrictEqual(result3);
    expect(result1).toMatch(/\w{8,}/);
    expect(result2).toMatch(/\w{8,}/);
    expect(result3).toMatch(/\w{8,}/);
  });
});

describe(createEip4361Message.name, () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  test("should return object with defaults for the target environment when called with service specific params", () => {
    const currentDate = new Date(2024, 10, 10, 10, 5, 10, 142);
    jest.setSystemTime(currentDate);

    const result = createEip4361Message({
      domain: "service.tld",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      uri: "https://service.tld/login",
      nonce: "RandomValue123",
    });

    expect(result).toStrictEqual({
      domain: "service.tld",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      uri: "https://service.tld/login",
      nonce: "RandomValue123",
      version: "1",
      chainId: 1,
      issuedAt: new Date().toISOString(),
    });
  });
});
