"use client";
import { IToken } from "../../expressions/Lexer";
import { Token } from "./Token";

export function Tokens({
  tokens,
  input,
  highlightIndex,
  onHover,
}: {
  tokens: IToken[] | undefined;
  input: string;
  highlightIndex?: number | undefined;
  onHover?: (token: IToken | undefined) => void;
}) {
  if (!tokens) return null;
  return (
    <div className="tokens">
      {tokens.map((token) => (
        <Token
          input={input}
          key={`token-${token.start}-${token.end}`}
          token={token}
          highlight={
            highlightIndex !== undefined &&
            highlightIndex >= 0 &&
            highlightIndex >= token.start &&
            highlightIndex <= token.end
          }
          onHover={(isEnter) => {
            onHover?.(isEnter ? token : undefined);
          }}
        />
      ))}
    </div>
  );
}
