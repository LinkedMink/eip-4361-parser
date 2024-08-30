import { Ast, AstCallback, identifiers, Parser, utilities } from "apg-lite";
import Eip4361Grammar from "../grammar/eip4361.js";
import type { Eip4361Message } from "./eip4361-types.js";
import { Eip4361ParseError } from "./errors.js";

const ROOT_GRAMMAR_NODE = "sign-in-with-ethereum";

const eip4361Grammar = new Eip4361Grammar();
const eip4361MessageParser = new Parser();
const eip4361MessageParserAst = new Ast();
eip4361MessageParser.ast = eip4361MessageParserAst;

const scheme: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE && phraseIndex === 0) {
    data.scheme = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks.scheme = scheme;

const domain: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.domain = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks.domain = domain;

const address: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.address = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks.address = address;

const statement: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.statement = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks.statement = statement;

const uri: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    if (!data.uri) {
      data.uri = utilities.charsToString(chars, phraseIndex, phraseLength);
    }
  }
  return ret;
};
eip4361MessageParser.ast.callbacks.uri = uri;

const version: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.version = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks.version = version;

const chainId: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.chainId = Number(utilities.charsToString(chars, phraseIndex, phraseLength));
  }
  return ret;
};
eip4361MessageParser.ast.callbacks["chain-id"] = chainId;

const nonce: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.nonce = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks.nonce = nonce;

const issuedAt: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.issuedAt = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks["issued-at"] = issuedAt;

const expirationTime: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.expirationTime = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks["expiration-time"] = expirationTime;

const notBefore: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.notBefore = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks["not-before"] = notBefore;

const requestId: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.requestId = utilities.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};
eip4361MessageParser.ast.callbacks["request-id"] = requestId;

const resources: AstCallback = function (state, chars, phraseIndex, phraseLength, data) {
  const ret = identifiers.SEM_OK;
  if (state === identifiers.SEM_PRE) {
    data.resources = utilities
      .charsToString(chars, phraseIndex, phraseLength)
      .slice(3)
      .split("\n- ");
  }
  return ret;
};
eip4361MessageParser.ast.callbacks.resources = resources;

export function parseEip4361Message(message: string): Eip4361Message {
  const result = eip4361MessageParser.parse(eip4361Grammar, ROOT_GRAMMAR_NODE, message);
  if (!result.success) {
    throw new Eip4361ParseError(result);
  }

  const messageObj: Partial<Eip4361Message> = {};
  eip4361MessageParserAst.translate(messageObj);

  return messageObj as Eip4361Message;
}
