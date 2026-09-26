interface CallMatch {
  start: number;
  end: number;
  args: string[];
}

function readArgs(source: string, open: number): { args: string[]; close: number } | null {
  const args: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let argStart = open + 1;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"') quote = char;
    else if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth === 0) {
        args.push(source.slice(argStart, index).trim());
        return { args: args.filter((arg, position) => arg !== "" || position > 0), close: index };
      }
    } else if (char === "," && depth === 1) {
      args.push(source.slice(argStart, index).trim());
      argStart = index + 1;
    }
  }
  return null;
}

function findCall(source: string, name: string, from: number): CallMatch | null {
  const pattern = new RegExp(`\\b${name}\\s*\\(`, "gi");
  pattern.lastIndex = from;
  const match = pattern.exec(source);
  if (!match) return null;
  const open = match.index + match[0].length - 1;
  const parsed = readArgs(source, open);
  return parsed ? { start: match.index, end: parsed.close + 1, args: parsed.args } : null;
}

export function rewriteCalls(source: string, name: string, build: (args: string[]) => string): string {
  let output = source;
  let cursor = 0;
  let call = findCall(output, name, cursor);
  while (call) {
    const replacement = build(call.args.map((arg) => rewriteCalls(arg, name, build)));
    output = output.slice(0, call.start) + replacement + output.slice(call.end);
    cursor = call.start + replacement.length;
    call = findCall(output, name, cursor);
  }
  return output;
}
