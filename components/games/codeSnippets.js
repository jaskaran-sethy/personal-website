// Code Typing's snippets: excerpts from famous open-source code, each credited to where it comes from. Lightly
// trimmed, with tabs turned into spaces and column alignment inside lines removed, so every line is fair to type.
// In these template strings, backslashes, backticks and "${" are escaped.

export const SNIPPETS = [
    {
        lang: "C++",
        source: "LLVM, Kaleidoscope tutorial: the lexer",
        license: "Apache-2.0 WITH LLVM-exception",
        code: `/// gettok - Return the next token from standard input.
static int gettok() {
  static int LastChar = ' ';

  // Skip any whitespace.
  while (isspace(LastChar))
    LastChar = getchar();

  if (isalpha(LastChar)) { // identifier: [a-zA-Z][a-zA-Z0-9]*
    IdentifierStr = LastChar;
    while (isalnum((LastChar = getchar())))
      IdentifierStr += LastChar;

    if (IdentifierStr == "def")
      return tok_def;
    if (IdentifierStr == "extern")
      return tok_extern;
    return tok_identifier;
  }

  if (isdigit(LastChar) || LastChar == '.') { // Number: [0-9.]+
    std::string NumStr;
    do {
      NumStr += LastChar;
      LastChar = getchar();
    } while (isdigit(LastChar) || LastChar == '.');

    NumVal = strtod(NumStr.c_str(), nullptr);
    return tok_number;
  }

  if (LastChar == '#') {
    // Comment until end of line.
    do
      LastChar = getchar();
    while (LastChar != EOF && LastChar != '\\n' && LastChar != '\\r');

    if (LastChar != EOF)
      return gettok();
  }

  // Check for end of file. Don't eat the EOF.
  if (LastChar == EOF)
    return tok_eof;

  // Otherwise, just return the character as its ascii value.
  int ThisChar = LastChar;
  LastChar = getchar();
  return ThisChar;
}`,
    },
    {
        lang: "C++",
        source: "LLVM, Kaleidoscope tutorial: operator-precedence parsing",
        license: "Apache-2.0 WITH LLVM-exception",
        code: `/// GetTokPrecedence - Get the precedence of the pending binary operator token.
static int GetTokPrecedence() {
  if (!isascii(CurTok))
    return -1;

  // Make sure it's a declared binop.
  int TokPrec = BinopPrecedence[CurTok];
  if (TokPrec <= 0)
    return -1;
  return TokPrec;
}

/// binoprhs
///   ::= ('+' primary)*
static std::unique_ptr<ExprAST> ParseBinOpRHS(int ExprPrec,
                                              std::unique_ptr<ExprAST> LHS) {
  // If this is a binop, find its precedence.
  while (true) {
    int TokPrec = GetTokPrecedence();

    // If this is a binop that binds at least as tightly as the current binop,
    // consume it, otherwise we are done.
    if (TokPrec < ExprPrec)
      return LHS;

    // Okay, we know this is a binop.
    int BinOp = CurTok;
    getNextToken(); // eat binop

    // Parse the primary expression after the binary operator.
    auto RHS = ParsePrimary();
    if (!RHS)
      return nullptr;

    // If BinOp binds less tightly with RHS than the operator after RHS, let
    // the pending operator take RHS as its LHS.
    int NextPrec = GetTokPrecedence();
    if (TokPrec < NextPrec) {
      RHS = ParseBinOpRHS(TokPrec + 1, std::move(RHS));
      if (!RHS)
        return nullptr;
    }

    // Merge LHS/RHS.
    LHS =
        std::make_unique<BinaryExprAST>(BinOp, std::move(LHS), std::move(RHS));
  }
}`,
    },
    {
        lang: "JavaScript",
        source: "The Super Tiny Compiler, by Jamie Kyle: the tokenizer",
        license: "CC-BY-4.0",
        code: `function tokenizer(input) {
  let current = 0;
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    if (char === '(') {
      tokens.push({ type: 'paren', value: '(' });
      current++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'paren', value: ')' });
      current++;
      continue;
    }

    let WHITESPACE = /\\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    if (char === '"') {
      let value = '';
      char = input[++current];
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current];
      tokens.push({ type: 'string', value });
      continue;
    }

    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = '';
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: 'name', value });
      continue;
    }

    throw new TypeError('I dont know what this character is: ' + char);
  }

  return tokens;
}`,
    },
    {
        lang: "C",
        source: "Linux kernel, include/linux/list.h",
        license: "GPL-2.0",
        code: `static inline void INIT_LIST_HEAD(struct list_head *list)
{
    WRITE_ONCE(list->next, list);
    WRITE_ONCE(list->prev, list);
}

/*
 * Insert a new entry between two known consecutive entries.
 *
 * This is only for internal list manipulation where we know
 * the prev/next entries already!
 */
static inline void __list_add(struct list_head *new,
                              struct list_head *prev,
                              struct list_head *next)
{
    if (!__list_add_valid(new, prev, next))
        return;

    next->prev = new;
    new->next = next;
    new->prev = prev;
    WRITE_ONCE(prev->next, new);
}

/**
 * list_add - add a new entry
 * @new: new entry to be added
 * @head: list head to add it after
 *
 * Insert a new entry after the specified head.
 * This is good for implementing stacks.
 */
static inline void list_add(struct list_head *new, struct list_head *head)
{
    __list_add(new, head, head->next);
}

/**
 * list_add_tail - add a new entry
 * @new: new entry to be added
 * @head: list head to add it before
 *
 * Insert a new entry before the specified head.
 * This is useful for implementing queues.
 */
static inline void list_add_tail(struct list_head *new, struct list_head *head)
{
    __list_add(new, head->prev, head);
}`,
    },
    {
        lang: "Python",
        source: "Peter Norvig, How to Write a Spelling Corrector",
        license: "MIT",
        code: `import re
from collections import Counter

def words(text): return re.findall(r'\\w+', text.lower())

WORDS = Counter(words(open('big.txt').read()))

def P(word, N=sum(WORDS.values())):
    "Probability of \`word\`."
    return WORDS[word] / N

def correction(word):
    "Most probable spelling correction for word."
    return max(candidates(word), key=P)

def candidates(word):
    "Generate possible spelling corrections for word."
    return (known([word]) or known(edits1(word)) or known(edits2(word)) or [word])

def known(words):
    "The subset of \`words\` that appear in the dictionary of WORDS."
    return set(w for w in words if w in WORDS)

def edits1(word):
    "All edits that are one edit away from \`word\`."
    letters = 'abcdefghijklmnopqrstuvwxyz'
    splits = [(word[:i], word[i:]) for i in range(len(word) + 1)]
    deletes = [L + R[1:] for L, R in splits if R]
    transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R)>1]
    replaces = [L + c + R[1:] for L, R in splits if R for c in letters]
    inserts = [L + c + R for L, R in splits for c in letters]
    return set(deletes + transposes + replaces + inserts)

def edits2(word):
    "All edits that are two edits away from \`word\`."
    return (e2 for e1 in edits1(word) for e2 in edits1(e1))`,
    },
    {
        lang: "Python",
        source: "Peter Norvig, lis.py: a Lisp interpreter in Python",
        license: "MIT",
        code: `def tokenize(chars):
    "Convert a string of characters into a list of tokens."
    return chars.replace('(', ' ( ').replace(')', ' ) ').split()

def read_from_tokens(tokens):
    "Read an expression from a sequence of tokens."
    if len(tokens) == 0:
        raise SyntaxError('unexpected EOF while reading')
    token = tokens.pop(0)
    if '(' == token:
        L = []
        while tokens[0] != ')':
            L.append(read_from_tokens(tokens))
        tokens.pop(0) # pop off ')'
        return L
    elif ')' == token:
        raise SyntaxError('unexpected )')
    else:
        return atom(token)

def atom(token):
    "Numbers become numbers; every other token is a symbol."
    try: return int(token)
    except ValueError:
        try: return float(token)
        except ValueError:
            return Symbol(token)

def eval(x, env=global_env):
    "Evaluate an expression in an environment."
    if isinstance(x, Symbol): # variable reference
        return env[x]
    elif not isinstance(x, List): # constant literal
        return x
    elif x[0] == 'if': # (if test conseq alt)
        (_, test, conseq, alt) = x
        exp = (conseq if eval(test, env) else alt)
        return eval(exp, env)
    elif x[0] == 'define': # (define var exp)
        (_, var, exp) = x
        env[var] = eval(exp, env)
    else: # (proc arg...)
        proc = eval(x[0], env)
        args = [eval(arg, env) for arg in x[1:]]
        return proc(*args)`,
    },
    {
        lang: "JavaScript",
        source: "left-pad, the npm package that broke the internet",
        license: "WTFPL",
        code: `module.exports = leftpad;

function leftpad (str, len, ch) {
  // convert \`str\` to \`string\`
  str = str + '';
  // \`len\` is the \`pad\`'s length now
  len = len - str.length;
  // doesn't need to pad
  if (len <= 0) return str;
  // \`ch\` defaults to \`' '\`
  if (!ch && ch !== 0) ch = ' ';
  // convert \`ch\` to \`string\`
  ch = ch + '';
  // \`pad\` starts with an empty string
  var pad = '';
  // loop
  while (true) {
    // add \`ch\` to \`pad\` if \`len\` is odd
    if (len & 1) pad += ch;
    // divide \`len\` by 2, ditch the remainder
    len >>= 1;
    // "double" the \`ch\` so this operation count grows logarithmically on \`len\`
    // each time \`ch\` is "doubled", the \`len\` would need to be "doubled" too
    // similar to finding a value in binary search tree, hence O(log(n))
    if (len) ch += ch;
    // \`len\` is 0, exit the loop
    else break;
  }
  // pad \`str\`!
  return pad + str;
}`,
    },
    {
        lang: "C",
        source: "Rob Pike's regular expression matcher, from Beautiful Code",
        license: "Excerpt",
        code: `/* match: search for regexp anywhere in text */
int match(char *regexp, char *text)
{
    if (regexp[0] == '^')
        return matchhere(regexp+1, text);
    do { /* must look even if string is empty */
        if (matchhere(regexp, text))
            return 1;
    } while (*text++ != '\\0');
    return 0;
}

/* matchhere: search for regexp at beginning of text */
int matchhere(char *regexp, char *text)
{
    if (regexp[0] == '\\0')
        return 1;
    if (regexp[1] == '*')
        return matchstar(regexp[0], regexp+2, text);
    if (regexp[0] == '$' && regexp[1] == '\\0')
        return *text == '\\0';
    if (*text!='\\0' && (regexp[0]=='.' || regexp[0]==*text))
        return matchhere(regexp+1, text+1);
    return 0;
}

/* matchstar: search for c*regexp at beginning of text */
int matchstar(int c, char *regexp, char *text)
{
    do { /* a * matches zero or more instances */
        if (matchhere(regexp, text))
            return 1;
    } while (*text != '\\0' && (*text++ == c || c == '.'));
    return 0;
}`,
    },
    {
        lang: "Python",
        source: "CPython, Lib/heapq.py",
        license: "PSF-2.0",
        code: `def heappush(heap, item):
    """Push item onto heap, maintaining the heap invariant."""
    heap.append(item)
    _siftdown(heap, 0, len(heap)-1)

def heappop(heap):
    """Pop the smallest item off the heap, maintaining the heap invariant."""
    lastelt = heap.pop() # raises appropriate IndexError if heap is empty
    if heap:
        returnitem = heap[0]
        heap[0] = lastelt
        _siftup(heap, 0)
        return returnitem
    return lastelt

# 'heap' is a heap at all indices >= startpos, except possibly for pos. pos
# is the index of a leaf with a possibly out-of-order value. Restore the
# heap invariant.
def _siftdown(heap, startpos, pos):
    newitem = heap[pos]
    # Follow the path to the root, moving parents down until finding a place
    # newitem fits.
    while pos > startpos:
        parentpos = (pos - 1) >> 1
        parent = heap[parentpos]
        if newitem < parent:
            heap[pos] = parent
            pos = parentpos
            continue
        break
    heap[pos] = newitem`,
    },
    {
        lang: "Go",
        source: "Go standard library, sort.Search",
        license: "BSD-3-Clause",
        code: `// Search uses binary search to find and return the smallest index i
// in [0, n) at which f(i) is true, assuming that on the range [0, n),
// f(i) == true implies f(i+1) == true. That is, Search requires that
// f is false for some (possibly empty) prefix of the input range [0, n)
// and then true for the (possibly empty) remainder; Search returns
// the first true index. If there is no such index, Search returns n.
// (Note that the "not found" return value is not -1 as in, for instance,
// strings.Index.)
// Search calls f(i) only for i in the range [0, n).
func Search(n int, f func(int) bool) int {
    // Define f(-1) == false and f(n) == true.
    // Invariant: f(i-1) == false, f(j) == true.
    i, j := 0, n
    for i < j {
        h := int(uint(i+j) >> 1) // avoid overflow when computing h
        // i <= h < j
        if !f(h) {
            i = h + 1 // preserves f(i-1) == false
        } else {
            j = h // preserves f(j) == true
        }
    }
    // i == j, f(i-1) == false, and f(j) (= f(i)) == true => answer is i.
    return i
}`,
    },
    {
        lang: "Rust",
        source: "Rust core library, Option",
        license: "MIT OR Apache-2.0",
        code: `impl<T> Option<T> {
    /// Returns \`true\` if the option is a [\`Some\`] value.
    pub const fn is_some(&self) -> bool {
        matches!(*self, Some(_))
    }

    /// Returns \`true\` if the option is a [\`None\`] value.
    pub const fn is_none(&self) -> bool {
        !self.is_some()
    }

    /// Returns the contained [\`Some\`] value or a provided default.
    pub fn unwrap_or(self, default: T) -> T {
        match self {
            Some(x) => x,
            None => default,
        }
    }

    /// Maps an \`Option<T>\` to \`Option<U>\` by applying a function to a contained value.
    pub fn map<U, F>(self, f: F) -> Option<U>
    where
        F: FnOnce(T) -> U,
    {
        match self {
            Some(x) => Some(f(x)),
            None => None,
        }
    }

    /// Returns [\`None\`] if the option is [\`None\`], otherwise calls \`f\` with the
    /// wrapped value and returns the result.
    pub fn and_then<U, F>(self, f: F) -> Option<U>
    where
        F: FnOnce(T) -> Option<U>,
    {
        match self {
            Some(x) => f(x),
            None => None,
        }
    }
}`,
    },
    {
        lang: "C",
        source: "Quake III Arena, id Software: the fast inverse square root",
        license: "GPL-2.0",
        code: `float Q_rsqrt( float number )
{
    long i;
    float x2, y;
    const float threehalfs = 1.5F;

    x2 = number * 0.5F;
    y = number;
    i = * ( long * ) &y; // evil floating point bit level hacking
    i = 0x5f3759df - ( i >> 1 ); // what the f***?
    y = * ( float * ) &i;
    y = y * ( threehalfs - ( x2 * y * y ) ); // 1st iteration
//  y = y * ( threehalfs - ( x2 * y * y ) ); // 2nd iteration, this can be removed

    return y;
}

float Q_fabs( float f ) {
    int tmp = * ( int * ) &f;
    tmp &= 0x7FFFFFFF;
    return * ( float * ) &tmp;
}

void VectorNormalizeFast( vec3_t v )
{
    float ilength;

    ilength = Q_rsqrt( DotProduct( v, v ) );

    v[0] *= ilength;
    v[1] *= ilength;
    v[2] *= ilength;
}`,
    },
];
