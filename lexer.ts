export enum TokenType {
  Number,
  Name,
  StringLiteral,
  Identifier,
  OpenParen,
  CloseParen,
  BinaryOperator,
  OpenBracket,
  CloseBracket,
  EndBracket,
  Equals,
  Let,
  Const,
  Args,
  Arg,
  Return,
  Counter,
  Type,
  SelfClosingTag,
  While,
  For,
  If,
  ElseIf,
  Else,
  From,
  To,
  Condition,
  OpenBrace,
  CloseBrace,
  Comment,
  StartTemplateString,
  EndTemplateString,
  StartInterpolation,
  EndInterpolation,
}

export interface Token {
  value: string;
  type: TokenType;
}

const specialIdentifiers = [
  "let",
  "const",
  "args",
  "arg",
  "return",
  "counter",
  "name",
  "type",
  "while",
  "for",
  "if",
  "elseIf",
  "else",
  "from",
  "to",
  "condition",
];

const isAlpha = (c: string | undefined): boolean => {
  return (
    c !== undefined &&
    (c.toUpperCase() !== c.toLowerCase() || c === "_" || c === "-")
  );
};

const isNumeric = (c: string | undefined): boolean => {
  return c !== undefined && !isNaN(parseInt(c));
};

export function tokenize(source: string): Token[] {
  const tokens = new Array<Token>();
  const src = source.split("");

  const skipWhitespace = () => {
    while (src.length > 0 && /\s/.test(src[0])) {
      src.shift();
    }
  };

  const skipComment = () => {
    if (src[1] === "/") {
      while (src.length > 0 && src[0] !== "\n") {
        src.shift();
      }
    }
  };

  while (src.length > 0) {
    skipWhitespace();

    if (src[0] === "/" && src[1] === "/") {
      skipComment();
    } else if (src[0] === "<") {
      if (src[1] === "/") {
        tokens.push({ value: "</", type: TokenType.EndBracket });
        src.shift();
        src.shift();
      } else {
        tokens.push({ value: "<", type: TokenType.OpenBracket });
        src.shift();
      }
    } else if (src[0] === ">") {
      tokens.push({ value: ">", type: TokenType.CloseBracket });
      src.shift();
    } else if (src[0] === "/") {
      if (src[1] === ">") {
        tokens.push({ value: "/>", type: TokenType.SelfClosingTag });
        src.shift();
      }
      src.shift();
    } else if (src[0] === "(") {
      tokens.push({ value: "(", type: TokenType.OpenParen });
      src.shift();
    } else if (src[0] === ")") {
      tokens.push({ value: ")", type: TokenType.CloseParen });
      src.shift();
    } else if (src[0] === "{") {
      tokens.push({ value: "{", type: TokenType.OpenBrace });
      src.shift();
    } else if (src[0] === "}") {
      tokens.push({ value: "}", type: TokenType.CloseBrace });
      src.shift();
    } else if ("+-*/".includes(src[0])) {
      tokens.push({ value: src[0], type: TokenType.BinaryOperator });
      src.shift();
    } else if (src[0] === "=") {
      tokens.push({ value: "=", type: TokenType.Equals });
      src.shift();
    } else if (src[0] === '"' || src[0] === "'") {
      // Handle regular strings
      const quote = src[0];
      src.shift(); // Skip the opening quote
      let str = "";
      while (src.length > 0 && src[0] !== quote) {
        str += src[0];
        src.shift();
      }
      src.shift(); // Skip the closing quote
      tokens.push({ value: str, type: TokenType.StringLiteral });
    } else {
      if (isNumeric(src[0]) || isAlpha(src[0])) {
        let word = "";
        while (src.length > 0 && (isAlpha(src[0]) || isNumeric(src[0]))) {
          word += src[0];
          src.shift();
        }
        if (!isNaN(Number(word))) {
          tokens.push({ value: word, type: TokenType.Number });
        } else if (specialIdentifiers.includes(word)) {
          tokens.push({
            value: word,
            type: TokenType[
              (word.charAt(0).toUpperCase() +
                word.slice(1)) as keyof typeof TokenType
            ],
          });
        } else {
          tokens.push({ value: word, type: TokenType.Identifier });
        }
      } else {
        src.shift();
      }
    }
  }

  return tokens;
}

// Example source code
const sourceCode = `
<const name={MyFunction} type="string">
    <args>
        <arg name={arg1} type="string" />
        <arg name={arg2} type="number" />
        <arg name={arg3} type="list" />
    </args>
    <const name={newstring} type="string">
        <arg1 /> + <arg2 /> + <arg3 index={0} />
    </const>
    <return>
        <newstring />
    </return>
</const>

// This is a comment

<let name={helloworld}> "Yippee! I love this language!" </let> // This is another comment

<print>
    <helloworld />
    <MyFunction arg1={"test"} arg2={0} arg3={["hi", "hello", "test"]}/>
</print>

<let name={foo} type="number"> 5 </let>
<let name={bar} type="number"> 10 </let>

<print>
    45 + (<foo /> * <bar />) // This is basically the same as 45 + (5 * 10)
</print>

<while condition={<foo /> < 10}>
    <foo /> = <foo /> + 1
</while>

<for counter={i} from={0} to={10}>
    <foo /> = <foo /> + <i />
</for>

<if condition={<foo /> == 1}>
    <print>"foo is 1"</print> 
</if>
<elseIf condition={<foo /> == 2}>
    <print>"foo is 2"</print>
</elseIf>
<else>
    <print>"foo is not 1 or 2"</print>
</else>
`;

const tokensFromSource = tokenize(sourceCode);
for (const token of tokensFromSource) {
  console.log(token, TokenType[token.type]);
}
