"use client";
import { Input } from "postcss";
import { IToken } from "../../expressions/Lexer";

export function Token({
  input,
  token,
  onHover,
}: {
  input: string;
  token: IToken;
  onHover?: (isEnter: boolean) => void;
}) {
  return (
    <span
      style={{ padding: "0.5em 0", cursor: "pointer", display: "inline-block" }}
      onPointerEnter={() => {
        onHover?.(true);
      }}
      onPointerLeave={() => {
        onHover?.(false);
      }}
    >
      <code
        style={{
          whiteSpace: "pre",
          background: token.type === "name" ? "#ddf" : "#eee",
          padding: "0.2rem",
          margin: "0 0.2rem",
          borderRadius: "2px",
          border: "1px solid #ccc",
        }}
        title={`(${token.start}-${token.end}): ${token.type}`}
      >
        {input?.slice(token.start, token.end + 1)}
      </code>
    </span>
  );
}
