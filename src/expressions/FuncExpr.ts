

// TODO: evaluate funct

// import { BaseExpr } from "./BaseExpr";
import { BaseExpr } from "./BaseExpr";
import { Expression } from "./Expression";

export class FuncExpr extends BaseExpr<"func"> {
  readonly name: string;
  readonly children: Expression[];

  constructor(start: number, end: number, name: string) {
    super("func", start, end);
    this.name = name;
    this.children = [];
  }

  evaluate() {
    return `SWAP(${this.name}())`;
  }
}
