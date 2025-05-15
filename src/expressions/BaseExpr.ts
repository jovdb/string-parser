export interface IExprItem<TType extends string = string> {
  readonly type: TType;
  readonly start: number;
  readonly end: number;
  readonly children?: IExprItem<string>[][];
}

export abstract class BaseExpr<TType extends string>
  implements IExprItem<TType>
{
  type: TType;
  start: number;
  end: number;
  children?: BaseExpr<string>[][];

  constructor(type: TType, start: number, end: number) {
    this.type = type;
    this.start = start;
    this.end = end;
  }

  abstract evaluate(): string;
}
