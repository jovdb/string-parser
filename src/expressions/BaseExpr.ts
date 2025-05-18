import { Expression } from "./Expression";

export interface IExprItem<TType extends string = string> {
  readonly type: TType;
  readonly start: number;
  readonly end: number;
  readonly children?: IExprItem<string>[];
}

export interface IEvaluateError {
  code: string;
  message: string;
}

export type VariableList = Record<string, () => string | Promise<string>>;

export interface IEvaluateContext {
  variables: VariableList;
}

export abstract class BaseExpr<TType extends string>
  implements IExprItem<TType>
{
  type: TType;
  start: number;
  end: number;
  children?: BaseExpr<string>[];

  constructor(type: TType, start: number, end: number) {
    this.type = type;
    this.start = start;
    this.end = end;
  }

  /** Return undefined on error */
  abstract evaluate(
    context: IEvaluateContext,
    onError?: (error: IEvaluateError) => void
  ): Promise<string> | string | undefined;
}
