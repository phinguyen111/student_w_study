import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const isWindows = process.platform === 'win32';
const compiledProgramName = isWindows ? 'program.exe' : 'program';

const REMOTE_PROVIDER = (process.env.CODE_EXECUTION_PROVIDER || '').toLowerCase();
const PISTON_BASE_URL = process.env.PISTON_BASE_URL || 'https://emkc.org/api/v2/piston';
const FORCE_REMOTE = process.env.CODE_EXECUTION_FORCE_REMOTE === 'true' || !!process.env.VERCEL;
const AUTO_REMOTE_ON_TOOL_MISSING = process.env.CODE_EXECUTION_AUTO_REMOTE !== 'false';

let pistonRuntimesCache = null;
let pistonRuntimesCacheAt = 0;

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  if (typeof fetch !== 'function') {
    throw new Error('Remote execution requires Node.js 18+ (global fetch). Please upgrade Node or disable remote execution provider.')
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function getPistonRuntimes() {
  const now = Date.now();
  if (pistonRuntimesCache && now - pistonRuntimesCacheAt < 5 * 60 * 1000) {
    return pistonRuntimesCache;
  }

  const response = await fetchWithTimeout(`${PISTON_BASE_URL}/runtimes`, {}, 15000);
  if (!response.ok) {
    throw new Error(`Failed to fetch runtimes from Piston (${response.status})`);
  }
  const data = await response.json();
  pistonRuntimesCache = Array.isArray(data) ? data : [];
  pistonRuntimesCacheAt = now;
  return pistonRuntimesCache;
}

function buildPistonLanguageCandidates(language) {
  const l = String(language || '').toLowerCase();
  const aliases = {
    python: ['python', 'python3', 'py'],
    javascript: ['javascript', 'node', 'js'],
    typescript: ['typescript', 'ts'],
    java: ['java'],
    cpp: ['cpp', 'c++'],
    c: ['c'],
    csharp: ['csharp', 'c#', 'cs'],
    go: ['go', 'golang'],
    rust: ['rust', 'rs'],
    php: ['php'],
    ruby: ['ruby'],
    bash: ['bash', 'sh'],
    powershell: ['powershell', 'pwsh', 'ps1'],
    r: ['r'],
    kotlin: ['kotlin'],
    swift: ['swift'],
    sql: ['sql'],
    html: ['html'],
    css: ['css'],
  };
  return aliases[l] || [l];
}

async function executeViaPiston({ language, code, input = '' }) {
  const runtimes = await getPistonRuntimes();
  const candidates = buildPistonLanguageCandidates(language);

  const findRuntime = (lang) => {
    const normalized = String(lang).toLowerCase();
    // Piston runtimes commonly look like: { language: 'python', version: '3.11.0', aliases: [...] }
    return runtimes.find((rt) => {
      const rtLang = String(rt.language || '').toLowerCase();
      const rtAliases = Array.isArray(rt.aliases) ? rt.aliases.map((a) => String(a).toLowerCase()) : [];
      return rtLang === normalized || rtAliases.includes(normalized);
    });
  };

  let runtime = null;
  let chosenLanguage = null;
  for (const c of candidates) {
    runtime = findRuntime(c);
    if (runtime) {
      chosenLanguage = runtime.language;
      break;
    }
  }

  if (!runtime || !chosenLanguage) {
    throw new Error(
      `Unsupported language on remote runner: ${language}. Available runtimes depend on the configured provider (${PISTON_BASE_URL}).`
    );
  }

  const payload = {
    language: chosenLanguage,
    version: runtime.version || '*',
    files: [{ name: 'main', content: code }],
    stdin: input || '',
    args: [],
    compile_timeout: 10000,
    run_timeout: 10000,
    compile_memory_limit: -1,
    run_memory_limit: -1,
  };

  const response = await fetchWithTimeout(
    `${PISTON_BASE_URL}/execute`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    20000
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Remote execution failed (${response.status}): ${data?.message || 'Unknown error'}`);
  }

  const compileOut = data?.compile?.output || '';
  const runOut = data?.run?.output || '';
  const output = `${compileOut}${compileOut && runOut ? '\n' : ''}${runOut}`.trimEnd();

  return {
    output: output || 'Program executed successfully (no output)',
    raw: data,
  };
}

function missingToolchainMessage({ language, command, phase }) {
  const base = `Missing ${phase} command: ${command}. This server cannot run ${language} code because the required tool is not installed or not on PATH.`;

  if (!isWindows) {
    return `${base}\nInstall it and ensure it's on PATH.`;
  }

  const winHints = {
    cpp: 'Install a C++ compiler (recommended: MSYS2 + MinGW-w64 g++), then restart the backend so PATH updates are applied.',
    c: 'Install a C compiler (recommended: MSYS2 + MinGW-w64 gcc), then restart the backend so PATH updates are applied.',
    rust: 'Install Rust (rustup) so rustc is available on PATH, then restart the backend.',
    go: 'Install Go so go.exe is available on PATH, then restart the backend.',
    java: 'Install JDK so javac/java are available on PATH, then restart the backend.',
    python: 'Install Python (python.exe) so it is available on PATH (avoid Store stubs), then restart the backend.',
  };

  const hint = winHints[language] || 'Install the required toolchain and ensure it is on PATH, then restart the backend.';
  return `${base}\n${hint}`;
}

function isMissingToolchainError(err) {
  const message = String(err?.message || '');
  return (
    message.includes('Missing compile command:') ||
    message.includes('Missing run command:') ||
    message.includes('cannot run') && message.includes('not installed')
  );
}

// Language configurations
const languageConfig = {
  html: {
    command: null,
    extension: '.html',
    timeout: 0,
    args: [],
  },
  css: {
    command: null,
    extension: '.css',
    timeout: 0,
    args: [],
  },
  sql: {
    command: null,
    extension: '.sql',
    timeout: 0,
    args: [],
  },
  python: {
    command: isWindows ? 'python' : 'python3',
    extension: '.py',
    timeout: 10000,
    args: [],
  },
  javascript: {
    command: 'node',
    extension: '.js',
    timeout: 10000,
    args: [],
  },
  typescript: {
    command: 'ts-node',
    extension: '.ts',
    timeout: 10000,
    args: [],
  },
  java: {
    command: 'java',
    extension: '.java',
    timeout: 15000,
    args: ['Main'],
    compile: {
      command: 'javac',
      args: [],
    },
  },
  cpp: {
    command: isWindows ? compiledProgramName : './program',
    extension: '.cpp',
    timeout: 15000,
    args: [],
    compile: {
      command: 'g++',
      args: ['-o', compiledProgramName],
    },
  },
  c: {
    command: isWindows ? compiledProgramName : './program',
    extension: '.c',
    timeout: 15000,
    args: [],
    compile: {
      command: 'gcc',
      args: ['-o', compiledProgramName],
    },
  },
  csharp: {
    command: 'dotnet',
    extension: '.cs',
    timeout: 15000,
    args: ['run'],
  },
  go: {
    command: 'go',
    extension: '.go',
    timeout: 15000,
    args: ['run'],
  },
  rust: {
    command: isWindows ? compiledProgramName : './program',
    extension: '.rs',
    timeout: 20000,
    args: [],
    compile: {
      command: 'rustc',
      args: ['-o', compiledProgramName],
    },
  },
  ruby: {
    command: 'ruby',
    extension: '.rb',
    timeout: 10000,
    args: [],
  },
  php: {
    command: 'php',
    extension: '.php',
    timeout: 10000,
    args: [],
  },
  swift: {
    command: 'swift',
    extension: '.swift',
    timeout: 15000,
    args: [],
  },
  kotlin: {
    command: 'kotlinc',
    extension: '.kt',
    timeout: 20000,
    args: ['-script'],
  },
  r: {
    command: 'Rscript',
    extension: '.r',
    timeout: 15000,
    args: [],
  },
  bash: {
    command: 'bash',
    extension: '.sh',
    timeout: 10000,
    args: [],
  },
  powershell: {
    command: 'powershell',
    extension: '.ps1',
    timeout: 10000,
    args: ['-File'],
  },
};

// Execute code
router.post('/execute', authenticate, async (req, res) => {
  const { code, language, input = '' } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      success: false,
      error: 'Code and language are required',
    });
  }

  // Special handling for HTML/CSS (no execution, just return)
  if (language === 'html' || language === 'css' || language === 'sql') {
    return res.json({
      success: true,
      output: `${language.toUpperCase()} code received. Preview available in browser.`,
      executionTime: 0,
    });
  }

  // Remote execution path (recommended for Vercel/serverless)
  if (FORCE_REMOTE || REMOTE_PROVIDER === 'piston') {
    try {
      const start = Date.now();
      const result = await executeViaPiston({ language, code, input });
      return res.json({
        success: true,
        output: result.output,
        executionTime: Date.now() - start,
      });
    } catch (error) {
      return res.json({
        success: false,
        error: error?.message || 'Remote execution failed',
        output: '',
      });
    }
  }

  const config = languageConfig[language];
  if (!config) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language: ${language}`,
    });
  }

  const tempDir = path.join(os.tmpdir(), `code-exec-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  const fileName = `Main${config.extension}`;
  const filePath = path.join(tempDir, fileName);

  try {
    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });

    // Write code to file
    fs.writeFileSync(filePath, code);

    let output = '';
    let errorOutput = '';
    let executionTime = Date.now();

    // Compile if needed
    if (config.compile) {
      const compileArgs = [...config.compile.args, filePath];
      const compileProcess = spawn(config.compile.command, compileArgs, {
        cwd: tempDir,
      });

      await new Promise((resolve, reject) => {
        let compileError = '';
        const timer = setTimeout(() => {
          try {
            compileProcess.kill();
          } catch {}
          reject(new Error('Compilation timeout'));
        }, config.timeout);

        compileProcess.stderr.on('data', (data) => {
          compileError += data.toString();
        });

        compileProcess.on('close', (code) => {
          clearTimeout(timer);
          if (code !== 0) {
            reject(new Error(`Compilation failed:\n${compileError}`));
          } else {
            resolve();
          }
        });

        compileProcess.on('error', (err) => {
          clearTimeout(timer);
          if (err?.code === 'ENOENT') {
            reject(
              new Error(
                `${missingToolchainMessage({
                  language,
                  command: config.compile.command,
                  phase: 'compile',
                })}\n\nTip: Set CODE_EXECUTION_PROVIDER=piston on the server to run languages via an online sandbox without local compilers.`
              )
            );
            return;
          }
          reject(err);
        });
      });
    }

    // Execute code
    const executeArgs = [...config.args];
    if (!config.compile) {
      executeArgs.push(filePath);
    }

    const executeProcess = spawn(config.command, executeArgs, {
      cwd: tempDir,
      shell: language === 'powershell' || language === 'bash',
    });

    // Send input if provided
    if (input) {
      executeProcess.stdin.write(input);
      executeProcess.stdin.end();
    }

    executeProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    executeProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        try {
          executeProcess.kill();
        } catch {}
        reject(new Error('Execution timeout'));
      }, config.timeout);

      executeProcess.on('close', (code) => {
        executionTime = Date.now() - executionTime;
        clearTimeout(timer);
        resolve();
      });

      executeProcess.on('error', (err) => {
        clearTimeout(timer);
        if (err?.code === 'ENOENT') {
          reject(
            new Error(
              `${missingToolchainMessage({
                language,
                command: config.command,
                phase: 'run',
              })}\n\nTip: Set CODE_EXECUTION_PROVIDER=piston on the server to run languages via an online sandbox without local toolchains.`
            )
          );
          return;
        }
        reject(err);
      });
    });

    // Clean up
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }

    res.json({
      success: true,
      output: output || 'Program executed successfully (no output)',
      error: errorOutput || undefined,
      executionTime,
    });
  } catch (error) {
    // Auto fallback to remote when toolchain is missing (e.g. g++ not installed)
    if (AUTO_REMOTE_ON_TOOL_MISSING && isMissingToolchainError(error)) {
      try {
        const start = Date.now();
        const result = await executeViaPiston({ language, code, input });
        // Clean up tempDir (local attempt may have created it)
        try {
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        } catch {}

        return res.json({
          success: true,
          output: result.output,
          executionTime: Date.now() - start,
          provider: 'piston',
        });
      } catch (remoteError) {
        // If remote also fails, return a combined message for easier debugging.
        const combinedMessage = `${error?.message || 'Execution failed'}\n\nRemote fallback failed: ${remoteError?.message || remoteError}`;

        try {
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        } catch {}

        return res.json({
          success: false,
          error: combinedMessage,
          output: '',
        });
      }
    }

    // Clean up on error
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }

    res.json({
      success: false,
      error: error.message || 'Execution failed',
      output: '',
    });
  }
});

// Get supported languages
router.get('/languages', authenticate, (req, res) => {
  const localLanguages = Object.keys(languageConfig).map((key) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    extension: languageConfig[key].extension,
    source: 'local',
  }));

  if (FORCE_REMOTE || REMOTE_PROVIDER === 'piston' || AUTO_REMOTE_ON_TOOL_MISSING) {
    getPistonRuntimes()
      .then((runtimes) => {
        const remoteLanguages = runtimes.map((rt) => ({
          id: rt.language,
          name: rt.language,
          extension: '',
          source: 'remote',
          version: rt.version,
          aliases: rt.aliases || [],
        }));

        const merged = [...localLanguages, ...remoteLanguages];
        res.json({ success: true, languages: merged, provider: 'piston', baseUrl: PISTON_BASE_URL });
      })
      .catch((err) => {
        res.json({ success: true, languages: localLanguages, provider: 'local', warning: err?.message });
      });
    return;
  }

  res.json({ success: true, languages: localLanguages, provider: 'local' });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Code execution API is running',
    supportedLanguages: Object.keys(languageConfig),
  });
});

export default router;
