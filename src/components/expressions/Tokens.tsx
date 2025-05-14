"use client";
import { IToken } from "../../expressions/Lexer";
import { Token } from "./Token";

export function Tokens({
  tokens,
  input,
  onHover,
}: {
  tokens: IToken[] | undefined;
  input: string;
  onHover?: (token: IToken | undefined) => void;
}) {
  if (!tokens) return null;
  return (
    <div className="tokens">
      {tokens.map((token) => (
        <Token
          input={input}
          key={`${token.start}-${token.end}`}
          token={token}
          onHover={(isEnter) => {
            onHover?.(isEnter ? token : undefined);
          }}
        />
      ))}
    </div>
  );
}
