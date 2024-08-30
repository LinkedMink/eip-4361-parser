import { isAddress } from "ethers";
import { z } from "zod";
import type { ZodSchemaEip4361Message } from "./zod-types.js";
import { Eip4361Version } from "../eip4361/constants.js";

// TODO static import won't work as optional peer dependency (needs to be installed or will produce an error).
// Tree-shaking should still exclude since it's a different file, but need to check
// export async function validateEip4361ZodSchema(): Promise<ZodSchemaEip4361> {
// const { z } = await import("zod");
// export function validateEip4361ZodSchema(): ZodSchemaEip4361 {
//   return z.object({
//     scheme: z.string().optional(),
//     domain: z
//       .string()
//       .min(1)
//       .regex(/[^#?]*/),
//     address: z.string().refine(isAddress, "Does not conform with ERC-55 address"),
//     statement: z.string().optional(),
//     uri: z.string().url(),
//     version: z.enum(["1"]),
//     chainId: z.number().int(),
//     nonce: z
//       .string()
//       .min(8)
//       .regex(/[a-zA-Z0-9]{8,}/),
//     issuedAt: z.string().datetime(),
//     expirationTime: z.string().datetime().optional(),
//     notBefore: z.string().datetime().optional(),
//     requestId: z.string().optional(),
//     resources: z.array(z.string()).optional(),
//   });
// }

export const zodSchemaEip4361Message: ZodSchemaEip4361Message = z.object({
  scheme: z.string().optional(),
  domain: z
    .string()
    .min(1)
    .regex(/[^#?]*/),
  address: z.string().refine(isAddress, "Does not conform with ERC-55 address"),
  statement: z.string().optional(),
  uri: z.string().url(),
  version: z.literal(Eip4361Version),
  chainId: z.number().int(),
  nonce: z
    .string()
    .min(8)
    .regex(/[a-zA-Z0-9]{8,}/),
  issuedAt: z.string().datetime(),
  expirationTime: z.string().datetime().optional(),
  notBefore: z.string().datetime().optional(),
  requestId: z.string().optional(),
  resources: z.array(z.string()).optional(),
});
