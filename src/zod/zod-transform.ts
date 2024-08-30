import { z, ZodEffects, ZodString } from "zod";
import { Eip4361Message } from "../eip4361/eip4361-types.js";
import { parseEip4361Message } from "../eip4361/parse-message.js";

// TODO static import won't work as optional peer dependency (needs to be installed or will produce an error).
// Tree-shaking should still exclude since it's a different file, but need to check
// export async function parseEip4361ZodTransform(): Promise<
//   ZodEffects<ZodString, Eip4361Message, string>
// > {
//   const { z } = await import("zod");
// export function parseEip4361ZodTransform(): ZodEffects<ZodString, Eip4361Message, string> {
//   return z.string().transform((input, ctx) => {
//     try {
//       return parseEip4361Message(input);
//     } catch {
//       ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Failed to parse EIP-4361 message" });
//       return z.NEVER;
//     }
//   });
// }

export const zodTransformStringToEip4361Message: ZodEffects<ZodString, Eip4361Message, string> = z
  .string()
  .transform((input, ctx) => {
    try {
      return parseEip4361Message(input);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Failed to parse EIP-4361 message" });
      return z.NEVER;
    }
  });
