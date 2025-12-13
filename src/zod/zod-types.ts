import type { z } from "zod";
import type { Eip4361VersionType } from "../eip4361/eip4361-types.js";

export type ZodSchemaEip4361Message = ReturnType<
  typeof z.object<{
    scheme: z.ZodOptional<z.ZodString>;
    domain: z.ZodString;
    address: z.ZodString;
    statement: z.ZodOptional<z.ZodString>;
    uri: z.ZodURL;
    version: z.ZodLiteral<Eip4361VersionType>;
    chainId: z.ZodNumber;
    nonce: z.ZodString;
    issuedAt: z.ZodISODateTime;
    expirationTime: z.ZodOptional<z.ZodISODateTime>;
    notBefore: z.ZodOptional<z.ZodISODateTime>;
    requestId: z.ZodOptional<z.ZodString>;
    resources: z.ZodOptional<z.ZodArray<z.ZodString>>;
  }>
>;
