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
  makeDivByZeroForm,
  makeImplicitContainerForm,
  makeJForm,
} from './index';
import { JamesAlgebraParser } from './parse-render';


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

test('it parses void', t => {
  let v = makeVoidForm();
  t.deepEqual(JamesAlgebraParser.parse(""), v);
  t.deepEqual(JamesAlgebraParser.parse(" "), v);
  t.deepEqual(JamesAlgebraParser.parse("  "), v);
  t.deepEqual(JamesAlgebraParser.parse("   "), v);
});
test('it parses ()  : 1', t => {
  const parse = JamesAlgebraParser.parse("()");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeUnitForm());
});
test('it parses [] : negative infinity', t => {
  const parse = JamesAlgebraParser.parse("[]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeSquareForm());
});
test('it parses <> : -0', t => {
  const parse = JamesAlgebraParser.parse("<>");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeDiamondForm());
});
test('it parses (()) : #, a generic, unknown base', t => {
  const parse = JamesAlgebraParser.parse("(())");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeRoundContainerForm([makeUnitForm()]));
});
test('it parses [()] : log 1', t => {
  const parse = JamesAlgebraParser.parse("[()]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeSquareContainerForm([makeUnitForm()]));
});
test('it parses ([]) : #^{-inf}', t => {
  const parse = JamesAlgebraParser.parse("([])");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeRoundContainerForm([makeSquareForm()]));
});
test('it parses ()() : 2', t => {
  const parse = JamesAlgebraParser.parse("()()");
  t.is(parse.formType, "container");
  const parsedContainer = parse as JamesAlgebraContainerForm;
  t.is(parsedContainer.children.length, 2);
  t.deepEqual(parsedContainer, makeImplicitContainerForm([makeUnitForm(), makeUnitForm()]));
});
test('it parses () <()> : 1 + -1', t => {
  const parse = JamesAlgebraParser.parse("() <()>");
  t.is(parse.formType, "container");
  const parsedContainer = parse as JamesAlgebraContainerForm;
  t.is(parsedContainer.children.length, 2);
  t.deepEqual(parsedContainer, makeImplicitContainerForm([
    makeUnitForm(),
    makeAngleContainerForm([makeUnitForm()])
  ]));
});
test('it parses [<()>] : log(-1)', t => {
  const parse = JamesAlgebraParser.parse("[<()>]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeJForm());
});
test('it parses (<[]>) : 1/0', t => {
  const parse = JamesAlgebraParser.parse("(<[]>)");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeDivByZeroForm());
});
test('it parses whole numbers', t => {
  let parse1 = JamesAlgebraParser.parse(" (     )  ");
  let parse2 = JamesAlgebraParser.parse("( ) ()  ");
  let parse3 = JamesAlgebraParser.parse("   ( ) (    )()");
  let parse4 = JamesAlgebraParser.parse(" ( ) ( ) ( ) ( )");
  t.deepEqual(parse1, makeCountingNumberForm(1));
  t.deepEqual(parse2, makeCountingNumberForm(2));
  t.deepEqual(parse3, makeCountingNumberForm(3));
  t.deepEqual(parse4, makeCountingNumberForm(4));
});
test('it parses (<[() ()]>) : 1/2', t => {
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
test("it parses all o's", t => {
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
test('it parses [<o>] : condensed J ', t => {
  const parse = JamesAlgebraParser.parse("[<o>]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeJForm());
});
test('it parses (<[oo]>] : condensed 1/2', t => {
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
test('it parses ([oo] <[ooo]>) : 2/3', t => {
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
test('it parses ([[<o>]] <[oo]>) : J/2', t => {
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

test('it parses (([[<o>]] <[oo]>)) : #^{J/2} = i', t => {
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

test("it parses literal J's", t => {
  const parseJ = JamesAlgebraParser.parse("J");
  const parseHalfJ = JamesAlgebraParser.parse("( [J] <[oo]> )");
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

});

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