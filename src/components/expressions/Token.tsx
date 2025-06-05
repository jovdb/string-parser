"use client";

import type { IToken } from "../../expressions/Lexer";

export function Token({
  highlight,
  token,
  onHover,
}: {
  highlight?: boolean;
  token: IToken;
  onHover?: (isEnter: boolean) => void;
}) {
  return (
    <span
      style={{
        padding: "0.5em 0.2em",
        cursor: "pointer",
        display: "inline-block",
        background: highlight ? "rgba(255, 150, 0, 0.5)" : "transparent",
      }}
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
          color:
            token.type === "name" || token.type === "constant"
              ? "#000"
              : "#888",
          padding: "0.2rem",
          margin: "0 0.2rem",
          borderRadius: "2px",
          border: "1px solid #ccc",
        }}
        title={`(${token.start}-${token.end}): ${token.type}`}
      >
        {token?.value}
      </code>
    </span>
  );
}
