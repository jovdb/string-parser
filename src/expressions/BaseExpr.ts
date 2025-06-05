export interface IExprItem<TType extends string = string> {
  readonly type: TType;
  readonly start: number;
  readonly end: number;
  readonly children?: IExprItem<string>[];
}

export interface IEvaluateError {
  code: string;
  start: number;
  end: number;
  message: string;
}

// TODO: Make interface with a description for variables and functions (arguments)

export type VariableList = Record<string, () => string | Promise<string>>;
export type FunctionList = Record<
  string,
  (...args: string[]) => string | Promise<string>
>;

export interface IEvaluateContext {
  variables: VariableList;
  functions: FunctionList;
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

  abstract evaluate(
    context: IEvaluateContext,
    onError?: (error: IEvaluateError) => void
  ): Promise<string | undefined>;
}
