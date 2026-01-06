export type DetectedLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'r'
  | 'sql'
  | 'bash'
  | 'powershell'
  | 'html-css-js'

export function preprocessListedCode(raw: string): string {
  if (!raw) return ''

  let text = raw.replace(/\r\n/g, '\n')

  // Strip Markdown fenced code blocks: ```lang\n...\n```
  const fenceStart = text.match(/^\s*```[^\n]*\n/)
  const fenceEnd = text.match(/\n\s*```\s*$/)
  if (fenceStart && fenceEnd) {
    text = text.replace(/^\s*```[^\n]*\n/, '')
    text = text.replace(/\n\s*```\s*$/, '')
  }

  const lines = text.split('\n')
  const cleanedLines = lines.map((line) => {
    // Preserve indentation after marker by removing only the marker + one space if present.
    // Examples handled:
    // 1. code
    // 1) code
    // - code
    // * code
    // + code
    let out = line

    // Numbered list
    out = out.replace(/^\s*\d+\s*[\.|\)]\s+/, '')

    // Bulleted list
    out = out.replace(/^\s*[-*+]\s+/, '')

    return out
  })

  return cleanedLines.join('\n').trimEnd()
}

function scoreByRules(code: string): Record<DetectedLanguage, number> {
  const scores: Record<DetectedLanguage, number> = {
    html: 0,
    css: 0,
    javascript: 0,
    typescript: 0,
    python: 0,
    java: 0,
    cpp: 0,
    c: 0,
    csharp: 0,
    go: 0,
    rust: 0,
    ruby: 0,
    php: 0,
    swift: 0,
    kotlin: 0,
    r: 0,
    sql: 0,
    bash: 0,
    powershell: 0,
    'html-css-js': 0,
  }

  const s = code

  // HTML / CSS / Multi
  if (/<(!doctype\s+html|html\b|head\b|body\b)/i.test(s)) scores.html += 6
  if (/<(div|span|p|h1|h2|script|style)\b/i.test(s)) scores.html += 2
  if (/<style\b[\s>]/i.test(s) && /<script\b[\s>]/i.test(s)) scores['html-css-js'] += 6
  if (/<script\b[\s>]/i.test(s)) scores['html-css-js'] += 2
  if (/<style\b[\s>]/i.test(s)) scores['html-css-js'] += 2

  if (/\b(body|html|\.\w+|#\w+)\s*\{/.test(s) && /:\s*[^;]+;/.test(s)) scores.css += 6
  if (/\b(color|background|display|flex|grid|margin|padding)\s*:/i.test(s)) scores.css += 2

  // SQL
  if (/^\s*(select|with|insert|update|delete|create)\b/i.test(s)) scores.sql += 5
  if (/\b(from|where|group\s+by|order\s+by|join)\b/i.test(s)) scores.sql += 2

  // Python
  if (/^\s*def\s+\w+\s*\(/m.test(s)) scores.python += 5
  if (/^\s*import\s+\w+/m.test(s) || /^\s*from\s+\w+\s+import\s+\w+/m.test(s)) scores.python += 2
  if (/\bprint\s*\(/.test(s)) scores.python += 2

  // Java
  if (/\bpublic\s+class\s+\w+/.test(s)) scores.java += 5
  if (/\bpublic\s+static\s+void\s+main\s*\(/.test(s)) scores.java += 4
  if (/System\.out\.println/.test(s)) scores.java += 2

  // C / C++
  if (/^\s*#include\s*<\w+[\w\.]*>/m.test(s)) scores.cpp += 4
  if (/\bstd::\w+/.test(s) || /using\s+namespace\s+std/.test(s)) scores.cpp += 3
  if (/\bprintf\s*\(/.test(s)) scores.c += 3
  if (/\bscanf\s*\(/.test(s)) scores.c += 2

  // Rust
  if (/\bfn\s+main\s*\(\s*\)\s*\{/.test(s)) scores.rust += 5
  if (/println!\s*\(/.test(s)) scores.rust += 2

  // Go
  if (/^\s*package\s+main\b/m.test(s)) scores.go += 5
  if (/\bfunc\s+main\s*\(\s*\)/.test(s)) scores.go += 3
  if (/\bfmt\.Println\s*\(/.test(s)) scores.go += 2

  // C#
  if (/\busing\s+System\b/.test(s)) scores.csharp += 5
  if (/Console\.WriteLine\s*\(/.test(s)) scores.csharp += 3

  // PHP
  if (/<\?php/.test(s)) scores.php += 6
  if (/\becho\b/.test(s) && /\$\w+/.test(s)) scores.php += 2

  // PowerShell / Bash
  if (/^\s*Write-Host\b/m.test(s) || /\$PSVersionTable/.test(s)) scores.powershell += 5
  if (/^\s*\$\w+\s*=/.test(s)) scores.powershell += 1

  if (/^\s*#!\/bin\/(bash|sh)/m.test(s)) scores.bash += 6
  if (/^\s*echo\b/m.test(s) && /\$\w+/.test(s)) scores.bash += 2

  // TypeScript / JavaScript
  if (/\binterface\s+\w+\b/.test(s)) scores.typescript += 4
  if (/\btype\s+\w+\s*=/.test(s)) scores.typescript += 2
  if (/\b:\s*(string|number|boolean|any|unknown)\b/.test(s)) scores.typescript += 2
  if (/\bconsole\.log\s*\(/.test(s)) scores.javascript += 2
  if (/\bfunction\b|=>/.test(s)) scores.javascript += 1

  return scores
}

export function detectLanguageFromCode(raw: string): DetectedLanguage | null {
  const cleaned = preprocessListedCode(raw).trim()
  if (cleaned.length < 10) return null

  // If user pasted a fenced code block with a language hint, honor it.
  const fenceLang = raw.match(/^\s*```\s*([a-zA-Z0-9_-]+)\s*\n/)
  if (fenceLang) {
    const lang = fenceLang[1].toLowerCase()
    const map: Record<string, DetectedLanguage> = {
      js: 'javascript',
      javascript: 'javascript',
      ts: 'typescript',
      typescript: 'typescript',
      py: 'python',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      csharp: 'csharp',
      go: 'go',
      rs: 'rust',
      rust: 'rust',
      php: 'php',
      sql: 'sql',
      sh: 'bash',
      bash: 'bash',
      powershell: 'powershell',
      ps1: 'powershell',
      html: 'html',
      css: 'css',
      kotlin: 'kotlin',
      swift: 'swift',
      r: 'r',
      ruby: 'ruby',
    }

    if (map[lang]) return map[lang]
  }

  const scores = scoreByRules(cleaned)
  let best: DetectedLanguage | null = null
  let bestScore = 0

  ;(Object.keys(scores) as DetectedLanguage[]).forEach((k) => {
    if (scores[k] > bestScore) {
      bestScore = scores[k]
      best = k
    }
  })

  // Conservative threshold to avoid noisy switching
  if (!best || bestScore < 5) return null

  // Prefer html-css-js only if it wins
  return best
}
