import { spawn } from 'node:child_process'
import { decode } from '@decoding/engine'
import { describe, expect, it } from 'vitest'

function runCli(
  args: string[],
  input = '',
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn(
      'pnpm',
      ['--filter', '@decoding/cli', 'exec', 'tsx', 'src/index.ts', ...args],
      { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] },
    )
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })
    child.on('close', (code) => resolve({ stdout, stderr, code }))
    child.stdin.end(input)
  })
}

describe('CLI process contract', () => {
  it('returns the same engine result as direct use for stdin JSON output', async () => {
    const input = 'eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ=='
    const direct = await decode(input)
    const cli = await runCli(['--json'], input)
    expect(cli.code).toBe(0)
    const jsonStart = cli.stdout.indexOf('{')
    const result = JSON.parse(cli.stdout.slice(jsonStart)) as typeof direct
    expect(result.root.selected?.detector).toBe(direct.root.selected?.detector)
    expect(result.root.children[0]?.selected?.detector).toBe(
      direct.root.children[0]?.selected?.detector,
    )
  }, 15_000)

  it('rejects positional payloads before reading or processing them', async () => {
    const cli = await runCli(['secret-on-command-line'])
    expect(cli.code).toBe(1)
    expect(cli.stderr).toContain('Positional payloads are disabled')
  }, 15_000)
})
