import test from 'ava';
import type {
  JamesAlgebraContainerForm,
  JamesAlgebraForm,
} from './index';
import {
  makeUnitForm,
  makeVoidForm,
  makeDiamondForm,
  makeSquareForm,
  makeAngleContainerForm,
  makeCountingNumberForm,
  makeRoundContainerForm,
  makeSquareContainerForm,
  makeVariableForm,
  makeDivByZeroForm,
  makeImplicitContainerForm,
  makeJForm,
} from './index';
import { JamesAlgebraFormRenderer, JamesAlgebraParser } from './parse-render';


// TODO: find good name for this. an "implicit-view" form?
//
// if form is:
//   - a container
//   - with no root
//   - and a single child form
// then returns the child form
// else return undefined
function unwrapSingletonForm(form: JamesAlgebraForm) : JamesAlgebraForm | undefined {
  if (form.formType !== "container" || (form.root !== undefined)
      || (form.children.length !== 1)) {
    return;
  }
  return form.children[0];
}

function round(children: Array<JamesAlgebraForm>) {
  return makeRoundContainerForm(children);
}

function square(children: Array<JamesAlgebraForm>) {
  return makeSquareContainerForm(children);
}

function angle(children: Array<JamesAlgebraForm>) {
  return makeAngleContainerForm(children);
}

function unit() {
  return makeUnitForm();
}


test('it parses void', (t: any) => {
  let v = makeVoidForm();
  t.deepEqual(JamesAlgebraParser.parse(""), v);
  t.deepEqual(JamesAlgebraParser.parse(" "), v);
  t.deepEqual(JamesAlgebraParser.parse("  "), v);
  t.deepEqual(JamesAlgebraParser.parse("   "), v);
});
test('it parses ()  : 1', (t: any) => {
  const parse = JamesAlgebraParser.parse("()");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeUnitForm());
});
test('it parses [] : negative infinity', (t: any) => {
  const parse = JamesAlgebraParser.parse("[]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeSquareForm());
});
test('it parses <> : -0', (t: any) => {
  const parse = JamesAlgebraParser.parse("<>");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeDiamondForm());
});
test('it parses (()) : #, a generic, unknown base', (t: any) => {
  const parse = JamesAlgebraParser.parse("(())");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeRoundContainerForm([makeUnitForm()]));
});
test('it parses [()] : log 1', (t: any) => {
  const parse = JamesAlgebraParser.parse("[()]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeSquareContainerForm([makeUnitForm()]));
});
test('it parses ([]) : #^{-inf}', (t: any) => {
  const parse = JamesAlgebraParser.parse("([])");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeRoundContainerForm([makeSquareForm()]));
});
test('it parses ()() : 2', (t: any) => {
  const parse = JamesAlgebraParser.parse("()()");
  t.is(parse.formType, "container");
  const parsedContainer = parse as JamesAlgebraContainerForm;
  t.is(parsedContainer.children.length, 2);
  t.deepEqual(parsedContainer, makeImplicitContainerForm([makeUnitForm(), makeUnitForm()]));
});
test('it parses () <()> : 1 + -1', (t: any) => {
  const parse = JamesAlgebraParser.parse("() <()>");
  t.is(parse.formType, "container");
  const parsedContainer = parse as JamesAlgebraContainerForm;
  t.is(parsedContainer.children.length, 2);
  t.deepEqual(parsedContainer, makeImplicitContainerForm([
    makeUnitForm(),
    makeAngleContainerForm([makeUnitForm()])
  ]));
});
test('it parses [<()>] : log(-1)', (t: any) => {
  const parse = JamesAlgebraParser.parse("[<()>]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeJForm());
});
test('it parses (<[]>) : 1/0', (t: any) => {
  const parse = JamesAlgebraParser.parse("(<[]>)");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeDivByZeroForm());
});
test('it parses whole numbers', (t: any) => {
  let parse1 = JamesAlgebraParser.parse(" (     )  ");
  let parse2 = JamesAlgebraParser.parse("( ) ()  ");
  let parse3 = JamesAlgebraParser.parse("   ( ) (    )()");
  let parse4 = JamesAlgebraParser.parse(" ( ) ( ) ( ) ( )");
  t.deepEqual(parse1, makeCountingNumberForm(1));
  t.deepEqual(parse2, makeCountingNumberForm(2));
  t.deepEqual(parse3, makeCountingNumberForm(3));
  t.deepEqual(parse4, makeCountingNumberForm(4));
});
test('it parses (<[() ()]>) : 1/2', (t: any) => {
  const parse = JamesAlgebraParser.parse("(<[() ()]>)");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeRoundContainerForm([
    makeAngleContainerForm([
      makeSquareContainerForm([
        makeUnitForm(),
        makeUnitForm()
      ])
    ])
  ]));
});
test("it parses all o's", (t: any) => {
  let parse1 = JamesAlgebraParser.parse("o");
  let parse2 = JamesAlgebraParser.parse(" oo");
  let parse3 = JamesAlgebraParser.parse("o  oo ");
  let parse4 = JamesAlgebraParser.parse("   oo o o");
  let parse5 = JamesAlgebraParser.parse("ooooo");
  t.deepEqual(parse1, makeCountingNumberForm(1));
  t.deepEqual(parse2, makeCountingNumberForm(2));
  t.deepEqual(parse3, makeCountingNumberForm(3));
  t.deepEqual(parse4, makeCountingNumberForm(4));
  t.deepEqual(parse5, makeCountingNumberForm(5));
});
test('it parses [<o>] : condensed J ', (t: any) => {
  const parse = JamesAlgebraParser.parse("[<o>]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeJForm());
});
test('it parses (<[oo]>] : condensed 1/2', (t: any) => {
  const parse = JamesAlgebraParser.parse("(<[oo]>)");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(
    unwrap,
    round([
      angle([
        square([
          unit(),
          unit()
        ])
      ])
    ])
  );
});
test('it parses ([oo] <[ooo]>) : 2/3', (t: any) => {
  const parse = JamesAlgebraParser.parse("([oo] <[ooo]>)");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(
    unwrap,
    round([
      square([
        unit(),
        unit()
      ]),
      angle([
        square([
          unit(),
          unit(),
          unit()
        ])
      ])
    ])
  );
});
test('it parses ([[<o>]] <[oo]>) : J/2', (t: any) => {
  const parse = JamesAlgebraParser.parse("([[<o>]] <[oo]>)");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(
    unwrap,
    round([
      square([makeJForm()]),
      angle([
        square([
          unit(),
          unit()
        ])
      ])
    ])
  );
});

test('it parses (([[<o>]] <[oo]>)) : #^{J/2} = i', (t: any) => {
  const parse = JamesAlgebraParser.parse("(([[<o>]] <[oo]>))");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(
    unwrap,
    round([
      round([
        square([makeJForm()]),
        angle([
          square([
            unit(),
            unit()
          ])
        ])
      ])
    ])
  );
});

test("it parses literal J's", (t: any) => {
  const parseJ = JamesAlgebraParser.parse("J");
  const parseHalfJ = JamesAlgebraParser.parse("( [J] <[oo]> )");
  const parseJSelfOcclusion = JamesAlgebraParser.parse("J ([J] J)")
  let unwrapJ = unwrapSingletonForm(parseJ);
  let unwrapHalfJ = unwrapSingletonForm(parseHalfJ);

  t.deepEqual(
    unwrapJ,
    makeJForm()
  );
  t.deepEqual(
    unwrapHalfJ,
    round([
      square([makeJForm()]),
      angle([
        square([
          unit(), unit()
        ])
      ])
    ])
  );
  t.deepEqual(
    parseJSelfOcclusion,
    makeImplicitContainerForm([
      makeJForm(),
      round([
        square([
          makeJForm()
        ]),
        makeJForm(),
      ])
    ])
  );

});

test("it parses literal variables", (t: any) => {
  const parse1 = JamesAlgebraParser.parse("A <A>");
  const parse2 = JamesAlgebraParser.parse("(A [B]) ([C] A)");
  const parse3 = JamesAlgebraParser.parse("A (J [A])");
  const elements1 = (parse1 as JamesAlgebraContainerForm).children;
  const elements2 = (parse2 as JamesAlgebraContainerForm).children;
  const elements3 = (parse3 as JamesAlgebraContainerForm).children;

  t.is(elements1.length, 2)
  t.deepEqual(
    elements1[0],
    makeVariableForm("A")
  )
  t.deepEqual(
    elements1[1],
    angle([
      makeVariableForm("A")
    ])
  )

  t.is(elements2.length, 2);
  t.deepEqual(
    elements2[0],
    round([
      makeVariableForm("A"),
      square([
        makeVariableForm("B")
      ])
    ])
  )
  t.deepEqual(
    elements2[1],
    round([
      square([
        makeVariableForm("C")
      ]),
      makeVariableForm("A"),
    ])
  )

  t.is(elements3.length, 2);
  t.deepEqual(
    elements3[0],
    makeVariableForm("A")
  )
  t.deepEqual(
    elements3[1],
    round([
      makeJForm(),
      square([
        makeVariableForm("A")
      ]),
    ])
  )
});

test("it parses numerals 2-9", (t: any) => {
  const parses = [
    0,
    1,
    JamesAlgebraParser.parse("2"),
    JamesAlgebraParser.parse("3"),
    JamesAlgebraParser.parse("4"),
    JamesAlgebraParser.parse("5"),
    JamesAlgebraParser.parse("6"),
    JamesAlgebraParser.parse("7"),
    JamesAlgebraParser.parse("8"),
    JamesAlgebraParser.parse("9"),
  ]

  for (let i = 2; i < 10; i++) {
    t.deepEqual(
      parses[i],
      makeCountingNumberForm(i),
    )
  }
});

test("it parses ([J] <[2]>)", (t: any) => {
  const parseJOver2 = JamesAlgebraParser.parse("([J] <[2]>)");
  const unwrapJOver2 = unwrapSingletonForm(parseJOver2);
  t.deepEqual(
    unwrapJOver2,
    round([
      square([
        makeJForm()
      ]),
      angle([
        square([
          makeUnitForm(), makeUnitForm()
        ])
      ])
    ])
  )
});

test("it parses 2/3", (t: any) => {
  const parseJOver2 = JamesAlgebraParser.parse("([2] <[3]>)");
  const unwrapJOver2 = unwrapSingletonForm(parseJOver2);
  t.deepEqual(
    unwrapJOver2,
    round([
      square([
        makeUnitForm(), makeUnitForm()
      ]),
      angle([
        square([
          makeUnitForm(), makeUnitForm(), makeUnitForm()
        ])
      ])
    ])
  )
});

// TODO: implement functionality, write tests for:
// let parsediLine1 = parser.parse("(([[<o>]] <[oo]>))");
// let parsediLine2 = parser.parse("(([J] <[2]>))");
// let parsediLine3 = parser.parse("(J/2)");

test("it parses and renders 1/2", (t: any) => {
  const input = "(<[()()]>)";
  const parse = JamesAlgebraParser.parse(input);
  const unwrap = unwrapSingletonForm(parse);
  const oneHalf =
    round([
      angle([
        square([
          unit(), unit()
        ])
      ])
    ]);

  t.deepEqual(unwrap, oneHalf)
  let rendered = JamesAlgebraFormRenderer.renderToString(unwrap!);
  t.is(rendered.replace(/\s/g, ''), input.replace(/\s/g, ''));
})


test("it parses and renders 2x3", (t: any) => {
  const input = "([()()][()()()])";
  const parse = JamesAlgebraParser.parse(input);
  const unwrap = unwrapSingletonForm(parse);
  const mult2x3 =
    round([
      square([
        unit(), unit()
      ]),
      square([
        unit(), unit(), unit()
      ])
    ]);

  t.deepEqual(unwrap, mult2x3)
  let rendered = JamesAlgebraFormRenderer.renderToString(unwrap!);
  t.is(rendered.replace(/\s/g, ''), input.replace(/\s/g, ''));

})
