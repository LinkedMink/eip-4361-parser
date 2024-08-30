/**
 * @todo Contribute to DefinitelyTyped
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped?tab=readme-ov-file#how-can-i-contribute
 */
declare module "apg-lite" {
  export interface GrammarRule {
    name: string;
    lower: string;
    index: number;
    isBkr: boolean;
    opcodes: unknown[];
  }

  export interface Grammar {
    grammarObject: string;
    rules: ApgGrammarRule[];
    udts: unknown[];
    toString: () => string;
  }

  export type GrammarConstructor = new () => Grammar;

  const parserState = {
    // Identifies the operator type.
    // NB: These must match the values in apg-js 4.3.0, apg-lib/identifiers.
    /* the original ABNF operators */
    ALT: 1 /* alternation */,
    CAT: 2 /* concatenation */,
    REP: 3 /* repetition */,
    RNM: 4 /* rule name */,
    TRG: 5 /* terminal range */,
    TBS: 6 /* terminal binary string, case sensitive */,
    TLS: 7 /* terminal literal string, case insensitive */,
    /* the super set, SABNF operators */
    UDT: 11 /* user-defined terminal */,
    AND: 12 /* positive look ahead */,
    NOT: 13 /* negative look ahead */,
    // Used by the parser and the user's `RNM` and `UDT` callback functions.
    // Identifies the parser state as it traverses the parse tree nodes.
    // - *ACTIVE* - indicates the downward direction through the parse tree node.
    // - *MATCH* - indicates the upward direction and a phrase, of length \> 0, has been successfully matched
    // - *EMPTY* - indicates the upward direction and a phrase, of length = 0, has been successfully matched
    // - *NOMATCH* - indicates the upward direction and the parser failed to match any phrase at all
    ACTIVE: 100,
    MATCH: 101,
    EMPTY: 102,
    NOMATCH: 103,
    // Used by [`AST` translator](./ast.html) (semantic analysis) and the user's callback functions
    // to indicate the direction of flow through the `AST` nodes.
    // - *SEM_PRE* - indicates the downward (pre-branch) direction through the `AST` node.
    // - *SEM_POST* - indicates the upward (post-branch) direction through the `AST` node.
    SEM_PRE: 200,
    SEM_POST: 201,
    // Ignored. Retained for backwords compatibility.
    SEM_OK: 300,
  } as const;

  export type ParserState = typeof parserState;
  export type ParserStateKey = keyof ParserState;
  export type ParserStateValue = ParserState[ParserStateKey];

  export type ParserCallback = (
    sys,
    chars: number[],
    phraseIndex: number,
    data: Record<string, unknown>,
  ) => void;

  export type ParseResult = {
    success: boolean;
    state: ParserStateValue;
    stateName: ParserStateKey;
    length: number;
    matched: number;
    maxMatched: number;
    maxTreeDepth: number;
    nodeHits: number;
  };

  export class Parser {
    ast?: Ast;
    stats?: Stats;
    trace?: Trace;
    // Array as object?
    callbacks: ParserCallback[] & Record<string, ParserCallback>;
    parse: (
      grammar: ApgGrammar,
      startName: string,
      inputString: string,
      callbackData?,
    ) => ParseResult;
  }

  export type AstCallback = (
    state: ParserStateValue,
    chars: number[],
    phraseIndex: number,
    phraseLength: number,
    data: Record<string, unknown>,
  ) => ParserStateValue;

  export class Ast {
    // Array as object?
    callbacks: AstCallback[] & Record<string, AstCallback>;
    init: (rulesIn, udtsIn, charsIn) => void;
    ruleDefined: (index: number) => boolean;
    udtDefined: (index: number) => boolean;
    down: (callbackIndex, name) => number;
    up: (callbackIndex, name, phraseIndex, phraseLength) => number;
    translate: (data: Record<string, unknown>) => void;
    setLength: (length: number) => void;
    getLength: () => number;
    toXml: () => string;
  }

  export class Trace {
    init: (r, u, c) => void;
    down: (op, offset) => void;
    up: (op, state, offset, phraseLength) => void;
    displayTrace: () => string;
  }

  export class Stats {
    init: (r, u) => void;
    collect: (op, sys) => void;
    displayStats: () => string;
    displayHits: () => string;
  }

  export const utilities: {
    stringToChars: (input: string) => number[];
    charsToString: (chars: number[], beg: number, len: number) => string;
  };

  export const identifiers: ParserState & {
    idName: (s: ParserStateValue) => ParserStateKey;
  };
}
