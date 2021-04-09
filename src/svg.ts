import { JamesAlgebraContainer, JamesAlgebraForm } from ".";

export interface FormSvgPathConfig {
  elementType: "path";
  pathData: string;
  color: string;
}

export interface FormSvgCircleConfig {
  elementType: "circle";
  cx: number;
  cy: number;
  r: number;
  color: string;
}

export interface FormSvgTextConfig {
  elementType: "text";
  textContent: string;
  x: number;
  y: number;
}

export type FormSvgElementConfig =
  | FormSvgPathConfig
  | FormSvgCircleConfig
  | FormSvgTextConfig

const SQUARE_COLOR = "#d42a20"
const ANGLE_COLOR = "#fac22b"
const ROUND_COLOR = "#0e638e"

function getUniqueChild(form: JamesAlgebraForm) : JamesAlgebraForm | undefined {
  if (form.formType !== "container") {
    throw new Error("Not implemented for non-containers");
  }
  if (form.children.length > 1) {
    throw new Error("Not implemented for forms having a container w/ more than one child");
  }
  if (form.children.length === 0) {
    return;
  }
  return form.children[0];
}


export function renderToSvg(form: JamesAlgebraForm): FormSvgElementConfig[] {
  // for the moment, only works on uni-forms (singly-nested forms, of the
  // shape { { { ... }_3 }_2 }_1
  // for all i, {}_i in the 3-element set:
  //    - []
  //    - ()
  //    - <>
  // )
  let svgConfigs: FormSvgElementConfig[] = []
  let containerStack : Array<JamesAlgebraContainer> = []

  if (form.formType === "variable") {
    throw new Error("variable rendering not yet implemented");
  }

  let currContainer: JamesAlgebraForm = form;
  // if root is implicit, we'll unwrap the unique child
  if (!form.root) {
    if (form.children.length === 0) {
      // void
      return [];
    }
    if (form.children.length > 1) {
      throw new Error("> 1 child containers not yet implemented");
    }
    currContainer = getUniqueChild(currContainer)!;
  }

  // traversal into the JA form, pushing containers onto a stack as we go
  let nextUniqueChild = getUniqueChild(currContainer);
  while (currContainer.formType === "container" && currContainer.root !== undefined
        && nextUniqueChild !== undefined) {
    containerStack.push(currContainer.root!);
    currContainer = nextUniqueChild;
    nextUniqueChild = getUniqueChild(currContainer);
  }
  if (currContainer.formType !== "container") {
    throw new Error("variable rendering not yet implemented");
  }
  if (currContainer.root === undefined) {
    throw new Error("implicit root containers are not allowed to occur anywhere except root");
  }
  containerStack.push(currContainer.root!);

  //  traverse the stack, drawing forms from the innermost to outermost
  // add result to svgConfigs
  const START_HEIGHT = 0.6;
  const D = 0.55;
  let h = START_HEIGHT;

  while (containerStack.length > 0) {
    let top = containerStack.pop();
    let newConfig: FormSvgElementConfig;
    switch (top) {
      case JamesAlgebraContainer.Angle:
        newConfig = makeAnglePath(h);
        break;
      case JamesAlgebraContainer.Round:
        newConfig = makeRoundCircle(h);
        break;
      case JamesAlgebraContainer.Square:
        newConfig = makeSquarePath(h);
        break;
    }
    svgConfigs.push(newConfig!);
    h = h + D;
  }

  return svgConfigs;
}

/*
  We want circle arc:
    - from (-C + A, -C)
    - to (-C - B, 0)
    - to (-C + A, C)

  and arc:
    - from (C - A, -C)
    - to (C + B, 0)
    - to (C - A, C)

  to draw circle arc we need the radius, R

  we assume that the center of the circle lies on a point, (D, 0),
  where D in [-1, 1]

  (1) :=  R = D - (-C - B) = C + B + D

  R^2 = (D - (-C + A))^2 + C^2
  R^2 = (C + B + D)^2

  so

  (2) := (D + C - A)^2 + C^2 = (C + B + D)^2

  we can assume A, B, C given, and use (2) to solve for D.
  then use (1) to solve for R

  (2) =>
    (D + C)^2 - 2A(D + C) + A^2 + C^2 = (D+C)^2 + 2B(D + C) + B^2
    -2B(D + C) - 2A(D + C)            = -A^2 - C^2 + B^2
    -2(D + C)(B + A)                  = -A^2 - C^2 + B^2
      (D + C)              = (A^2 + C^2 - B^2) / 2(A + B)
    D = -C + (A^2 + C^2 - B^2) / 2(A+B)
*/
export function makeRoundPath(height: number): FormSvgPathConfig {
  // const C = 0.8
  // const A = 0.1
  const C = height / 2;
  const A = C / 8;
  const B = A
  const D = (Math.pow(A, 2) + Math.pow(C, 2) - Math.pow(B, 2)) / (2 * (A + B)) - C
  const R = B + C + D
  const roundPath = `M ${-C + A} ${-C} A ${R} ${R} 0 0 0 ${-C + A} ${C}
                    L ${C - A} ${C} A ${R} ${R} 0 0 0 ${C - A} ${-C} Z`
  return {
    elementType: "path",
    pathData: roundPath,
    color: ROUND_COLOR,
  };
}

export function makeSquarePath(height: number): FormSvgPathConfig {
  const C = height / 2;
  const squarePath = `M ${-C} ${-C} L ${-C} ${C}
                      L  ${C}  ${C} L  ${C} ${-C} Z`;
  return {
    elementType: "path",
    pathData: squarePath,
    color: SQUARE_COLOR,
  };
}

export function makeAnglePath(height: number): FormSvgPathConfig {
  const C = height / Math.sqrt(3);
  const anglePath =
    `M ${C} 0.0
      L ${C * 0.5} ${C * Math.sqrt(3)/2}
      L ${-C * 0.5} ${C * Math.sqrt(3)/2}
      L ${-C} 0.0
      L ${-C * 0.5} ${-C * Math.sqrt(3)/2}
      L ${C * 0.5} ${-C * Math.sqrt(3)/2}
      Z`
  return {
    elementType: "path",
    pathData: anglePath,
    color: ANGLE_COLOR,
  };
}

export function makeRoundCircle(height: number): FormSvgCircleConfig {
  return {
    elementType: "circle",
    cx: 0,
    cy: 0,
    r: height/2,
    color: ROUND_COLOR,
  }
}
