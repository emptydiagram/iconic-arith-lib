import { JamesAlgebraContainer, JamesAlgebraForm, makeJForm, makeRootedForm, makeUnitForm, makeVariableForm } from "./index";

export function containerSymbolToEnum(sym: string) : JamesAlgebraContainer | undefined {
  return ["[", "]"].includes(sym)
    ? JamesAlgebraContainer.Square
    : ["(", ")"].includes(sym)
    ? JamesAlgebraContainer.Round
    : ["<", ">"].includes(sym)
    ? JamesAlgebraContainer.Angle
    : undefined;
}

export enum JamesAlgebraContainerSymbolDirection {
  Open,
  Close,
}

export function enumToContainerSymbol(container: JamesAlgebraContainer, direction: JamesAlgebraContainerSymbolDirection) {
  switch(container) {
    case JamesAlgebraContainer.Round:
      return direction === JamesAlgebraContainerSymbolDirection.Open
        ? "(" : ")";
    case JamesAlgebraContainer.Square:
      return direction === JamesAlgebraContainerSymbolDirection.Open
        ? "[" : "]";
    case JamesAlgebraContainer.Angle:
      return direction === JamesAlgebraContainerSymbolDirection.Open
        ? "<" : ">";
  }
}

interface JamesAlgebraParserStackInfo {
  container: JamesAlgebraContainer;
  queue: Array<JamesAlgebraForm>;
}

class JamesAlgebraParserStack {
  containerStack: Array<JamesAlgebraContainer> = [];
  queueStack: Array<Array<JamesAlgebraForm>> = [];

  push(container: JamesAlgebraContainer) {
    this.containerStack.push(container);
    this.queueStack.push([]);
  }

  pop() : JamesAlgebraParserStackInfo | undefined {
    if (this.isEmpty()) {
      return;
    }
    let container = this.containerStack.pop()!;
    let queue = this.queueStack.pop()!;
    return {
      container,
      queue,
    };
  }

  peek() {
    if (this.isEmpty()) {
      return;
    }
    let n = this.size();
    let container = this.containerStack[n - 1];
    let queue = this.queueStack[n - 1]
    return {
      container,
      queue,
    };
  }

  size(): number {
    return this.containerStack.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  topQueue() {
    if (this.isEmpty()) {
      return;
    }
    let top = this.peek()!;
    return top.queue;
  }

  addToTopQueue(form: JamesAlgebraForm) {
    if (this.isEmpty()) {
      throw new Error("Stack is empty, cannot add to non-existent queue.")
    }
    let topQueue: Array<JamesAlgebraForm> = this.topQueue()!;
    topQueue.push(form);
  }

}

const openContainerSymbols = ["[", "(", "<"];
const containerSymbols = ["[", "]", "(", ")", "<", ">"];

export class JamesAlgebraParser {
  static parse(text: string) : JamesAlgebraForm {
    let parserStack = new JamesAlgebraParserStack();
    let inputText = text.trim();
    let forms: JamesAlgebraForm[] = []
    while (inputText.length > 0) {
      // if it's an 'o' or 'J', make a unit/J form and push into form queue
      // if it's open, push onto stack
      // if it's close and matches open on top of stack
      //   let result = wrap queue contents in container
      //   pop stack
      //   if stack is now empty:
      //     add to forms?
      //   else:
      //     insert result into queue of new stack top
      // else it's a mismatch error

      const firstChar = inputText.charAt(0);

      if (firstChar === 'o') {
        if (parserStack.isEmpty()) {
          forms.push(makeUnitForm());
        } else {
          parserStack.addToTopQueue(makeUnitForm());
        }
        inputText = inputText.substring(1).trim();
        continue;
      }
      if (firstChar === 'J') {
        if (parserStack.isEmpty()) {
          forms.push(makeJForm());
        } else {
          parserStack.addToTopQueue(makeJForm());
        }
        inputText = inputText.substring(1).trim();
        continue;
      }
      if (/[A-Z]/.test(firstChar)) {
        const newForm = makeVariableForm(firstChar);
        if (parserStack.isEmpty()) {
          forms.push(newForm);
        } else {
          parserStack.addToTopQueue(newForm);
        }
        inputText = inputText.substring(1).trim();
        continue;
      }
      if (/[2-9]/.test(firstChar)) {
        let number = parseInt(firstChar);
        for (let i = 0; i < number; i++) {
          if (parserStack.isEmpty()) {
            forms.push(makeUnitForm());
          } else {
            parserStack.addToTopQueue(makeUnitForm());
          }
        }
        inputText = inputText.substring(1).trim();
        continue;
      }
      if (!containerSymbols.includes(firstChar)) {
        throw new Error(`Unrecognized char: ${firstChar}`);
      }
      if (openContainerSymbols.includes(firstChar)) {
        inputText = inputText.substring(1).trim();
        parserStack.push(containerSymbolToEnum(firstChar)!);
      } else {
        // close
        if (parserStack.isEmpty()) {
          throw new Error(`Mismatch detected, closing symbol '${firstChar}' with empty stack`);
        }
        let topContainer = parserStack.peek()!.container;
        if (topContainer !== containerSymbolToEnum(firstChar)) {
          // FIXME: this is goofy, right? need to redo this
          let openSymbol = enumToContainerSymbol(topContainer, JamesAlgebraContainerSymbolDirection.Open);
          throw new Error(`Mismatch detected, '${firstChar}' does not match '${openSymbol}'`);
        }

        // opening and closing containers match, so
        // pop parserStack.
        // create a new form, of type topContainer, with topQueue as the contained elements for the new form
        // enqueue to the (new) top of parserStack's queue
        let prevTop = parserStack.pop()!;
        let newForm = makeRootedForm(topContainer, prevTop.queue);
        if (!parserStack.isEmpty()) {
          parserStack.addToTopQueue(newForm);
        } else {
          forms.push(newForm);
        }
        inputText = inputText.substring(1).trim();
      }
    }
    return {
      formType: "container",
      children: forms,
    }
  }

}


export class JamesAlgebraFormRenderer {
  static renderToString(f: JamesAlgebraForm): string {
    let s: string = "";
    let startSymbol = "";
    let endSymbol = "";
    if (f.formType == "container") {
      if (f.root) {
        switch (f.root) {
          case JamesAlgebraContainer.Round:
            startSymbol = "(";
            endSymbol = ")";
            break;
          case JamesAlgebraContainer.Square:
            startSymbol = "[";
            endSymbol = "]";
            break;
          case JamesAlgebraContainer.Angle:
            startSymbol = "<";
            endSymbol = ">";
            break;
        }
      }
      s = s + startSymbol;
      if (f.children.length > 0) {
        for(var i = 0; i < f.children.length; i++) {
          s = s + this.renderToString(f.children[i]);
        }
      } else {
        s = s + " ";
      }
      s = s + endSymbol;
    } else {
      // variable
      s = s + f.name;
    }
    return s;
  }

}