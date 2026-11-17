/**
 * Utility to safely parse JSON returned by Gemini API,
 * handling markdown codeblocks, unescaped control chars,
 * and truncated JSON structures (auto-closing strings, arrays, and objects).
 */

export function safeParseGeminiJson<T>(rawText: string, fallback: T): T {
  if (!rawText || typeof rawText !== 'string') {
    return fallback;
  }

  // 1. Strip markdown code fences if present
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();

  // Try standard parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch (initialErr) {
    // Continue to repair attempts
  }

  // 2. Replace unescaped newlines/tabs inside string literals
  // (Gemini sometimes outputs literal newlines inside strings)
  try {
    const sanitized = cleaned
      .replace(/[\u0000-\u001F]+/g, (match) => {
        if (match === '\n') return '\\n';
        if (match === '\r') return '';
        if (match === '\t') return '\\t';
        return '';
      });
    return JSON.parse(sanitized) as T;
  } catch {
    // Continue to structural repair
  }

  // 3. Repair truncated JSON (e.g. max tokens cutoff)
  try {
    const repaired = repairTruncatedJson(cleaned);
    return JSON.parse(repaired) as T;
  } catch (err) {
    console.warn('[safeParseGeminiJson] Failed to parse/repair Gemini JSON, using fallback:', err);
    return fallback;
  }
}

/**
 * Repairs truncated JSON by balancing quotes, arrays, and objects
 */
function repairTruncatedJson(jsonStr: string): string {
  let inString = false;
  let escape = false;
  const stack: ('{' | '[')[] = [];
  let lastCharIndex = -1;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      lastCharIndex = i;
      continue;
    }

    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack.length && stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack.length && stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
      if (!/\s/.test(char)) {
        lastCharIndex = i;
      }
    }
  }

  let result = jsonStr;

  // If cut off inside a string literal, close the quote
  if (inString) {
    result += '"';
  }

  // Trim trailing comma or incomplete key/colon if any
  result = result.replace(/,\s*$/, '');
  result = result.replace(/:\s*$/, ': null');

  // Close unclosed arrays and objects in reverse order
  while (stack.length > 0) {
    const expected = stack.pop();
    if (expected === '{') {
      result += '}';
    } else if (expected === '[') {
      result += ']';
    }
  }

  return result;
}
