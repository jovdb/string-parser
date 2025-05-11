import React, { CSSProperties, useRef, useEffect, useCallback } from "react";

interface HighlightableInputProps {
  value: string;
  onChange: (newValue: string) => void;
  highlightRegion?: { start: number; end: number } | undefined;
  highlightColor?: string;
  style?: CSSProperties;
  spellCheck?: "true" | "false";
}

// Helper function to get cursor position (character offset) within an element
const getCharOffset = (element: HTMLElement): number => {
  let offset = 0;
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    // Ensure the range is within the element before proceeding
    if (element.contains(range.startContainer)) {
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      offset = preCaretRange.toString().length;
    }
  }
  return offset;
};

// Helper function to set cursor position (character offset) within an element
const setCharOffset = (element: HTMLElement, targetOffset: number) => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  let charIndex = 0;
  let foundPosition = false;

  // Stack for iterative DFS traversal of nodes
  const nodeStack: Node[] = Array.from(element.childNodes).reverse();

  while (nodeStack.length > 0) {
    const node = nodeStack.pop()!;

    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const textLength = textNode.length;
      if (charIndex + textLength >= targetOffset) {
        range.setStart(textNode, targetOffset - charIndex);
        range.collapse(true); // Collapse to the start of the set range
        foundPosition = true;
        break;
      }
      charIndex += textLength;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const children = Array.from(node.childNodes);
      for (let i = children.length - 1; i >= 0; i--) {
        nodeStack.push(children[i]);
      }
    }
  }

  // If targetOffset is at the very end of the content or element is empty
  if (
    !foundPosition &&
    (element.textContent === null || targetOffset >= element.textContent.length)
  ) {
    range.selectNodeContents(element);
    range.collapse(false); // Collapse to the end
    foundPosition = true;
  }

  if (foundPosition) {
    selection.removeAllRanges();
    selection.addRange(range);
  } else if (targetOffset === 0) {
    // Failsafe for empty or problematic content, place at start
    range.selectNodeContents(element);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const escapeHtml = (unsafe: string) =>
  unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function HighlightableInput({
  value,
  onChange,
  highlightRegion,
  highlightColor = "rgba(255, 229, 100, 0.5)", // Default: semi-transparent light yellow
  style,
  spellCheck = "false",
}: HighlightableInputProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const renderContentToString = useCallback((): string => {
    const currentVal = value ?? ""; // Ensure value is a string
    if (
      !highlightRegion ||
      highlightRegion.start === undefined ||
      highlightRegion.end === undefined ||
      highlightRegion.start < 0 ||
      highlightRegion.end > currentVal.length || // Corrected boundary condition
      highlightRegion.start > highlightRegion.end
    ) {
      return escapeHtml(currentVal);
    }

    const before = escapeHtml(currentVal.substring(0, highlightRegion.start));
    const highlighted = escapeHtml(
      currentVal.substring(highlightRegion.start, highlightRegion.end + 1)
    );
    const after = escapeHtml(currentVal.substring(highlightRegion.end + 1));

    return `${before}<span style="background-color: ${highlightColor};">${highlighted}</span>${after}`;
  }, [value, highlightRegion, highlightColor]);

  useEffect(() => {
    if (!divRef.current) return;

    let charOffset = -1;

    const isFocused = document.activeElement === divRef.current;
    if (isFocused) {
      charOffset = getCharOffset(divRef.current);
    }

    const newHtml = renderContentToString();
    if (divRef.current.innerHTML !== newHtml) {
      divRef.current.innerHTML = newHtml;
      if (isFocused && charOffset !== -1) {
        setCharOffset(divRef.current, charOffset);
      }
    }
  }, [value, highlightRegion, highlightColor, renderContentToString]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || "";
    onChange(newText);
  };

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning={true}
      onInput={handleInput}
      style={{
        border: "1px solid #999",
        padding: "1px 3px",
        whiteSpace: "pre",
        overflowX: "auto",
        minHeight: "1.5em",
        fontFamily: "monospace", // Defaulting from original input
        width: "100%", // Defaulting from original input
        ...style,
      }}
      spellCheck={spellCheck === "true"}
      // dangerouslySetInnerHTML is removed; useEffect handles content
    />
  );
}
