import { z, ZodPipe, ZodString, ZodTransform } from "zod";
import type { Eip4361Message } from "../eip4361/eip4361-types.js";
import { parseEip4361Message } from "../eip4361/parse-message.js";

export const zodTransformStringToEip4361Message: ZodPipe<
  ZodString,
  ZodTransform<Eip4361Message, string>
> = z.string().transform((input, ctx) => {
  try {
    return parseEip4361Message(input);
  } catch {
    ctx.addIssue({ code: "custom", message: "Failed to parse EIP-4361 message" });
    return z.NEVER;
  }
});
