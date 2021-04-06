export enum JamesAlgebraContainer {
  Round = "Round",
  Square = "Square",
  Angle = "Angle",
}

export interface JamesAlgebraContainerForm {
  formType: "container",
  root?: JamesAlgebraContainer,
  children: Array<JamesAlgebraForm>,
}

export interface JamesAlgebraVariableForm {
  formType: "variable",
  name: string,
}

export type JamesAlgebraForm =
  | JamesAlgebraContainerForm
  | JamesAlgebraVariableForm


export function makeVariableForm(name: string) : JamesAlgebraVariableForm {
  return {
    formType: "variable",
    name,
  }
}

export function makeRootedForm(
  root: JamesAlgebraContainer,
  children: Array<JamesAlgebraForm>
)  : JamesAlgebraContainerForm {
  return {
    formType: "container",
    root,
    children,
  }
}

export function makeImplicitContainerForm(children: Array<JamesAlgebraForm>): JamesAlgebraContainerForm {
  return {
    formType: "container",
    children,
  }
}

export function makeRoundContainerForm(children: Array<JamesAlgebraForm>) {
  return makeRootedForm(JamesAlgebraContainer.Round, children);
}

export function makeSquareContainerForm(children: Array<JamesAlgebraForm>) {
  return makeRootedForm(JamesAlgebraContainer.Square, children);
}

export function makeAngleContainerForm(children: Array<JamesAlgebraForm>) {
  return makeRootedForm(JamesAlgebraContainer.Angle, children);
}

export function makeVoidForm() : JamesAlgebraContainerForm {
  return makeImplicitContainerForm([]);
}

export function makeUnitForm() : JamesAlgebraContainerForm {
  return makeRoundContainerForm([]);
}

export function makeSquareForm() : JamesAlgebraContainerForm {
  return makeSquareContainerForm([]);
}

export function makeDiamondForm() : JamesAlgebraContainerForm {
  return makeAngleContainerForm([]);
}

export function makeJForm() : JamesAlgebraContainerForm {
  return makeSquareContainerForm(
    [makeAngleContainerForm(
      [makeRoundContainerForm([])]
    )]
  );
}

export function makeDivByZeroForm() : JamesAlgebraContainerForm {
  return makeRoundContainerForm(
    [makeAngleContainerForm(
      [makeSquareContainerForm([])]
    )]
  );
}

export function makeCountingNumberForm(n: number): JamesAlgebraContainerForm{
  if (!Number.isInteger(n) && n > 0) {
    throw Error("argument must be a positive integer");
  }
  const units = Array.from({length: n}).map(x => makeUnitForm());
  return makeImplicitContainerForm(units);
}

export function makeMultForm(multiplicands: Array<JamesAlgebraForm>) : JamesAlgebraContainerForm {
  return makeRoundContainerForm(
    multiplicands.map(form => makeSquareContainerForm([form])));

}
