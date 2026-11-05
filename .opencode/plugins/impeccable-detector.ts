/**
 * Hook de detector de diseño de Impeccable para OpenCode.
 *
 * Se ejecuta después de cada edición de un archivo de UI (.jsx, .tsx, .js,
 * .ts, .css, …) y escanea ese archivo con el detector de Impeccable. Si
 * encuentra problemas, los inyecta en el contexto del agente para que los
 * corrija antes de dar por terminada la tarea.
 *
 * El hook nunca bloquea la edición: solo emite un recordatorio.
 *
 * Configuración (`.impeccable/config.json`):
 *   hook.enabled   -> si es false, el hook no hace nada (por defecto: true)
 *   hook.quiet     -> silencia los acks de "todo limpio" (por defecto: false)
 *   hook.limits.maxFindings / maxChars
 */

import { spawn } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve } from "node:path"

const UI_EXTENSIONS = [
  ".tsx",
  ".jsx",
  ".ts",
  ".js",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".vue",
  ".svelte",
  ".astro",
]

/** Extensiones que el detector escanea pero que solo reportan si hay hallazgos. */
const QUIET_EXTENSIONS = [".ts", ".js", ".mjs", ".cjs"]

const MAX_FINDINGS = 5
const MAX_CHARS = 8000
const SCAN_TIMEOUT_MS = 30_000

type ToolInput = Record<string, unknown>

interface DetectorResult {
  code: number
  stdout: string
  stderr: string
}

interface Finding {
  antipattern?: string
  rule?: string
  id?: string
  name?: string
  message?: string
  description?: string
  detail?: string
  severity?: string
  line?: number
  snippet?: string
}

function findSkillRoot(): string | null {
  const candidates = [
    join(homedir(), ".config", "opencode", "skills", "impeccable", "scripts"),
    join(homedir(), ".opencode", "skills", "impeccable", "scripts"),
    join(homedir(), ".claude", "skills", "impeccable", "scripts"),
  ]
  return candidates.find((dir) => existsSync(join(dir, "impeccable.cmd"))) ?? null
}

/**
 * Devuelve el comando a ejecutar para el detector.
 *
 * Se prefiere el binario nativo (`impeccable.exe`): lanzarlo evita por completo
 * el `cmd.exe /c` con comillas, que en Node rompe las rutas. Si no está, se
 * cae al launcher `.cmd` (o al script shell) y se envuelve en cmd.exe.
 */
function resolveDetectorCommand(): { command: string; args: string[] } | null {
  const root = findSkillRoot()
  if (!root) return null

  const arch = process.arch === "arm64" ? "arm64" : "x64"
  const exe = join(root, "bin", `windows-${arch}`, "impeccable.exe")
  if (existsSync(exe)) {
    return { command: exe, args: [] }
  }

  const windowsLauncher = join(root, "impeccable.cmd")
  if (existsSync(windowsLauncher)) {
    return {
      command: process.env.ComSpec ?? "cmd.exe",
      args: ["/d", "/c", `"${windowsLauncher}"`],
    }
  }

  const unixLauncher = join(root, "impeccable")
  if (existsSync(unixLauncher)) {
    return { command: unixLauncher, args: [] }
  }

  return null
}

function readProjectConfig(directory: string): Record<string, any> {
  const configPath = join(directory, ".impeccable", "config.json")
  if (!existsSync(configPath)) return {}
  try {
    return JSON.parse(readFileSync(configPath, "utf8")) ?? {}
  } catch {
    return {}
  }
}

function isUiFile(filePath: string): boolean {
  const lower = filePath.toLowerCase()
  if (lower.includes("node_modules") || lower.includes("\\.git\\") || lower.includes("/.git/")) {
    return false
  }
  return UI_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

function extractFilePath(input: unknown, tool: string): string | null {
  if (!input || typeof input !== "object") return null
  const record = input as ToolInput
  const candidate =
    record.filePath ?? record.path ?? record.file ?? record.file_path ?? record.target
  if (typeof candidate !== "string") return null
  if (!isUiFile(candidate)) return null
  // Solo los archivos de edición de código; el detector escanea lo que se le pase.
  if (tool !== "write" && tool !== "edit" && tool !== "patch" && tool !== "multiedit") {
    return null
  }
  return candidate
}

function runDetector(
  command: string,
  baseArgs: string[],
  cwd: string,
  target: string,
): Promise<DetectorResult> {
  return new Promise((resolvePromise) => {
    let settled = false
    const finish = (value: DetectorResult) => {
      if (settled) return
      settled = true
      resolvePromise(value)
    }

    let child
    try {
      child = spawn(command, [...baseArgs, "detect", "--json", target], {
        cwd,
        windowsHide: true,
        shell: false,
      })
    } catch (error) {
      finish({ code: -1, stdout: "", stderr: String(error) })
      return
    }

    let stdout = ""
    let stderr = ""
    const timer = setTimeout(() => {
      try {
        child.kill()
      } catch {}
      finish({ code: -1, stdout, stderr: "timeout" })
    }, SCAN_TIMEOUT_MS)

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString()
    })
    child.on("error", (error) => {
      clearTimeout(timer)
      finish({ code: -1, stdout, stderr: String(error) })
    })
    child.on("close", (code) => {
      clearTimeout(timer)
      finish({ code: code ?? -1, stdout, stderr })
    })
  })
}

function parseFindings(stdout: string): Finding[] | null {
  const start = stdout.indexOf("[")
  const end = stdout.lastIndexOf("]")
  if (start === -1 || end === -1 || end < start) return null
  try {
    const parsed = JSON.parse(stdout.slice(start, end + 1))
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function formatFindings(findings: Finding[], target: string): string | null {
  if (!findings || findings.length === 0) return null
  const lines: string[] = []
  for (const finding of findings.slice(0, MAX_FINDINGS)) {
    const rule = finding.antipattern ?? finding.rule ?? finding.id ?? "regla"
    const title = finding.name ?? finding.message ?? finding.detail ?? "sin detalle"
    const description = finding.description ?? finding.message ?? ""
    const severity = finding.severity ? `[${finding.severity}] ` : ""
    const snippet = finding.snippet ? ` — "${finding.snippet}"` : ""
    const line = finding.line ? ` (línea ${finding.line})` : ""
    lines.push(`- ${severity}${rule}${line}: ${title}${description ? ` — ${description}` : ""}${snippet}`)
  }
  const more =
    findings.length > MAX_FINDINGS
      ? `\n- …y ${findings.length - MAX_FINDINGS} hallazgo(s) más.`
      : ""
  return [
    `Detector de diseño de Impeccable: ${findings.length} hallazgo(s) en ${target}`,
    ...lines,
    more,
    "",
    "Revisa estos hallazgos y corrige lo que corresponda antes de terminar. Si alguno es una decisión intencionada, explícalo y sigue adelante.",
  ].join("\n")
}

export default {
  id: "impeccable-design-detector",
  async setup(ctx: any) {
    const detector = resolveDetectorCommand()

    if (!detector) {
      console.warn(
        "[impeccable] No se encontró el motor de Impeccable. " +
          "Instálalo con: npx impeccable install --providers=opencode --scope=global --yes",
      )
      return
    }

    await ctx.tool.hook("execute.after", async (event: any) => {
      if (event.status !== "completed") return

      const target = extractFilePath(event.input, event.tool)
      if (!target) return

      const directory = ctx.location?.directory ?? process.cwd()
      const config = readProjectConfig(directory)
      const hookConfig = config.hook ?? {}

      if (hookConfig.enabled === false) return

      const quiet = hookConfig.quiet === true
      const limits = hookConfig.limits ?? {}
      const maxFindings = Number(limits.maxFindings ?? MAX_FINDINGS)
      const maxChars = Number(limits.maxChars ?? MAX_CHARS)

      // Ruta absoluta: el detector la resuelve con git, y las rutas relativas
      // con barras invertidas se interpretan mal en Windows.
      const absoluteTarget = resolve(directory, target)

      const result = await runDetector(detector.command, detector.args, directory, absoluteTarget)
      if (result.code !== 0 && !result.stdout) return

      const findings = parseFindings(result.stdout)
      if (!findings) return

      if (findings.length === 0) {
        // Sin hallazgos: solo un ack breve, y solo en archivos "UI de verdad".
        const ext = target.toLowerCase().slice(target.lastIndexOf("."))
        if (quiet || QUIET_EXTENSIONS.includes(ext)) return
        ctx.session.prompt({
          sessionID: event.sessionID,
          text: `[impeccable] Sin hallazgos de diseño en ${target}. Continúa.`,
          delivery: "queue",
        }).catch(() => {})
        return
      }

      let report = formatFindings(
        findings.slice(0, maxFindings),
        target,
      )
      if (report && report.length > maxChars) {
        report = report.slice(0, maxChars) + "\n…(recortado)"
      }
      if (!report) return

      ctx.session
        .prompt({
          sessionID: event.sessionID,
          text: report,
          delivery: "queue",
        })
        .catch(() => {})
    })
  },
}
