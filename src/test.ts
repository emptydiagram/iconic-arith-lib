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
import { JamesAlgebraParser } from './parser';


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
test('it parses ()', t => {
  const parse = JamesAlgebraParser.parse("()");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeUnitForm());
});
test('it parses []', t => {
  const parse = JamesAlgebraParser.parse("[]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeSquareForm());
});
test('it parses <>', t => {
  const parse = JamesAlgebraParser.parse("<>");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeDiamondForm());
});
test('it parses (())', t => {
  const parse = JamesAlgebraParser.parse("(())");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeRoundContainerForm([makeUnitForm()]));
});
test('it parses [()]', t => {
  const parse = JamesAlgebraParser.parse("[()]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeSquareContainerForm([makeUnitForm()]));
});
test('it parses ([])', t => {
  const parse = JamesAlgebraParser.parse("([])");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeRoundContainerForm([makeSquareForm()]));
});
test('it parses ()()', t => {
  const parse = JamesAlgebraParser.parse("()()");
  t.is(parse.formType, "container");
  const parsedContainer = parse as JamesAlgebraContainerForm;
  t.is(parsedContainer.children.length, 2);
  t.deepEqual(parsedContainer, makeImplicitContainerForm([makeUnitForm(), makeUnitForm()]));
});
test('it parses () <()>', t => {
  const parse = JamesAlgebraParser.parse("() <()>");
  t.is(parse.formType, "container");
  const parsedContainer = parse as JamesAlgebraContainerForm;
  t.is(parsedContainer.children.length, 2);
  t.deepEqual(parsedContainer, makeImplicitContainerForm([
    makeUnitForm(),
    makeAngleContainerForm([makeUnitForm()])
  ]));
});
test('it parses [<()>]', t => {
  const parse = JamesAlgebraParser.parse("[<()>]");
  let unwrap = unwrapSingletonForm(parse);
  t.deepEqual(unwrap, makeJForm());
});
test('it parses (<[]>)', t => {
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
test('it parses (<[() ()]>)', t => {
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