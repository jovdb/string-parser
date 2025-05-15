import { BaseExpr } from "./BaseExpr";

export class FuncExpr extends BaseExpr<"func"> {
  readonly name: string;

  constructor(start: number, end: number, name: string) {
    super("func", start, end);
    this.name = name;
    this.children = [];
  }

  evaluate() {
    return `SWAP(${this.name}())`;
  }
}
