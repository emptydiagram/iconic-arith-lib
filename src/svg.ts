
export interface FormSvgPathConfig {
  pathData: string;
  color: string;
}

export interface FormSvgRoundCircleConfig {
  cx: number;
  cy: number;
  r: number;
  color: string;
}

export interface FormSvgTextConfig {
  textContent: string;
  x: number;
  y: number;
}

export type FormSvgElementConfig =
  | FormSvgPathConfig
  | FormSvgRoundCircleConfig
  | FormSvgTextConfig

const SQUARE_COLOR = "#d42a20"
const ANGLE_COLOR = "#fac22b"
const ROUND_COLOR = "#0e638e"

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
    pathData: roundPath,
    color: ROUND_COLOR,
  };
}

export function makeSquarePath(height: number): FormSvgPathConfig {
  const C = height / 2;
  const squarePath = `M ${-C} ${-C} L ${-C} ${C}
                      L  ${C}  ${C} L  ${C} ${-C} Z`;
  return {
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
    pathData: anglePath,
    color: ANGLE_COLOR,
  };
}

export function makeRoundCircle(height: number): FormSvgRoundCircleConfig {
  return {
    cx: 0,
    cy: 0,
    r: height/2,
    color: ROUND_COLOR,
  }
}
