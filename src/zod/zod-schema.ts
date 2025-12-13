import { isAddress } from "ethers";
import { z } from "zod";
import { Eip4361Version } from "../eip4361/constants.js";
import type { ZodSchemaEip4361Message } from "./zod-types.js";

export const zodSchemaEip4361Message: ZodSchemaEip4361Message = z.object({
  scheme: z.string().optional(),
  domain: z
    .string()
    .min(1)
    .regex(/[^#?]*/),
  address: z.string().refine(isAddress, "Does not conform with ERC-55 address"),
  statement: z.string().optional(),
  uri: z.url(),
  version: z.literal(Eip4361Version),
  chainId: z.number().int(),
  nonce: z
    .string()
    .min(8)
    .regex(/[a-zA-Z0-9]{8,}/),
  issuedAt: z.iso.datetime(),
  expirationTime: z.iso.datetime().optional(),
  notBefore: z.iso.datetime().optional(),
  requestId: z.string().optional(),
  resources: z.array(z.string()).optional(),
});
