import { writeFile } from "node:fs/promises"

const [, , beforePath, afterPath, sizeArg = "256"] = Bun.argv
const size = Number(sizeArg)
const rounds = 100_000
const warmupRuns = 3
const measuredRuns = 7

async function run(path: string): Promise<{ elapsedMs: number; result: unknown }> {
  const started = performance.now()
  const proc = Bun.spawn(["bun", path, String(size), String(rounds)], { stdout: "pipe", stderr: "pipe" })
  const output = await new Response(proc.stdout).text()
  const exitCode = await proc.exited
  if (exitCode !== 0) throw new Error(`${path} exited with ${exitCode}`)
  return { elapsedMs: performance.now() - started, result: JSON.parse(output) }
}

for (let i = 0; i < warmupRuns; i++) {
  await run(beforePath)
  await run(afterPath)
}

const before: number[] = []
const after: number[] = []
let beforeResult: unknown
let afterResult: unknown
for (let i = 0; i < measuredRuns; i++) {
  const beforeRun = await run(beforePath)
  const afterRun = await run(afterPath)
  before.push(beforeRun.elapsedMs)
  after.push(afterRun.elapsedMs)
  beforeResult = beforeRun.result
  afterResult = afterRun.result
}

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const beforeMedianMs = median(before)
const afterMedianMs = median(after)
const lessTimePercent = (beforeMedianMs - afterMedianMs) / beforeMedianMs * 100
const throughputRatio = beforeMedianMs / afterMedianMs
const result = {
  size,
  rounds,
  before: { samplesMs: before, medianMs: beforeMedianMs, result: beforeResult },
  after: { samplesMs: after, medianMs: afterMedianMs, result: afterResult },
  lessTimePercent,
  throughputRatio
}
console.log(JSON.stringify(result, null, 2))
await writeFile(`result-${size}.json`, JSON.stringify(result, null, 2) + "\n")
