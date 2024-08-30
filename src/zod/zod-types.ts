import type { z, ZodArray, ZodEffects, ZodLiteral, ZodNumber, ZodOptional, ZodString } from "zod";
import type { Eip4361Version } from "../eip4361/constants.js";

export type ZodSchemaEip4361Message = ReturnType<
  typeof z.object<{
    scheme: ZodOptional<ZodString>;
    domain: ZodString;
    address: ZodEffects<ZodString, string, string>;
    statement: ZodOptional<ZodString>;
    uri: ZodString;
    version: ZodLiteral<typeof Eip4361Version>;
    chainId: ZodNumber;
    nonce: ZodString;
    issuedAt: ZodString;
    expirationTime: ZodOptional<ZodString>;
    notBefore: ZodOptional<ZodString>;
    requestId: ZodOptional<ZodString>;
    resources: ZodOptional<ZodArray<ZodString>>;
  }>
>;
