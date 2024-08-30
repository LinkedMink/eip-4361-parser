import type { CreateBrowserEip4361Params, Eip4361Message } from "./eip4361-types.js";
import { createEip4361Message } from "./create-message.js";

export function createBrowserEip4361Message(params: CreateBrowserEip4361Params): Eip4361Message {
  return createEip4361Message({
    ...params,
    scheme: window.location.protocol.substring(0, window.location.protocol.length - 1),
    domain: window.location.host,
    uri: window.location.origin,
  });
}
