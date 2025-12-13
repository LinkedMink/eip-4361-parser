import { xdescribe, expect, jest, test } from "@jest/globals";
import type { ParseResult } from "apg-lite";
import { Eip4361ParseError } from "../../src/eip4361/errors.js";
import { parseEip4361Message } from "../../src/eip4361/parse-message.js";
import { zodTransformStringToEip4361Message } from "../../src/zod/zod-transform.js";

jest.mock("../../src/eip4361/parse-message.js");

xdescribe("zodTransformStringToEip4361Message", () => {
  test("should return parsed message when input correctly formatted", () => {
    const stubMessageResult = {
      scheme: "https",
      domain: "service.tld",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      statement:
        "service.tld will use your public transactions to verify and create a unique account associated with your Ethereum account",
      uri: "https://service.tld/login",
      version: "1" as const,
      chainId: 1,
      nonce: "32891756",
      issuedAt: "2021-09-30T16:25:24Z",
      resources: ["https://service.tld/api"],
    };
    (parseEip4361Message as jest.Mock<typeof parseEip4361Message>).mockReturnValue(
      stubMessageResult,
    );

    const result = zodTransformStringToEip4361Message.safeParse(`
service.tld wants you to sign in with your Ethereum account:
0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2

service.tld will use your public transactions to verify and create a unique account associated with your Ethereum account

URI: https://service.tld/login
Version: 1
Chain ID: 1
Nonce: 32891756
Issued At: 2021-09-30T16:25:24Z
Resources:
- https://service.tld/api
`);

    expect(result.success).toBe(true);
    expect(result.data).toBe(stubMessageResult);
  });

  test("should return error when input incorrectly formatted", () => {
    (parseEip4361Message as jest.Mock<typeof parseEip4361Message>).mockImplementation(() => {
      throw new Eip4361ParseError({} as ParseResult);
    });

    const result = zodTransformStringToEip4361Message.safeParse("Not a EIP-4361 message");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].code).toStrictEqual("custom");
    expect(result.error?.issues[0].message).toStrictEqual("Failed to parse EIP-4361 message");
  });
});
