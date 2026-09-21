import { writeFile } from "node:fs/promises"
import { spawn } from "node:child_process"

const [, , runtime, beforePath, afterPath, sizeArg = "256"] = process.argv
const size = Number(sizeArg)
const rounds = size >= 4096 ? 10_000 : 100_000
const warmupRuns = 3
const measuredRuns = 7

function run(path) {
  return new Promise((resolve, reject) => {
    const started = performance.now()
    const child = spawn(runtime, [path, String(size), String(rounds)], {
      stdio: ["ignore", "pipe", "pipe"]
    })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", chunk => { stdout += chunk })
    child.stderr.on("data", chunk => { stderr += chunk })
    child.on("error", reject)
    child.on("close", code => {
      if (code !== 0) {
        reject(new Error(`${runtime} ${path} exited with ${code}: ${stderr}`))
      } else {
        resolve({ elapsedMs: performance.now() - started, result: JSON.parse(stdout) })
      }
    })
  })
}

for (let i = 0; i < warmupRuns; i++) {
  await run(beforePath)
  await run(afterPath)
}

const before = []
const after = []
let beforeResult
let afterResult
for (let i = 0; i < measuredRuns; i++) {
  const beforeRun = await run(beforePath)
  const afterRun = await run(afterPath)
  before.push(beforeRun.elapsedMs)
  after.push(afterRun.elapsedMs)
  beforeResult = beforeRun.result
  afterResult = afterRun.result
}

const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const beforeMedianMs = median(before)
const afterMedianMs = median(after)
const result = {
  runtime,
  size,
  rounds,
  before: { samplesMs: before, medianMs: beforeMedianMs, result: beforeResult },
  after: { samplesMs: after, medianMs: afterMedianMs, result: afterResult },
  lessTimePercent: (beforeMedianMs - afterMedianMs) / beforeMedianMs * 100,
  throughputRatio: beforeMedianMs / afterMedianMs
}

console.log(JSON.stringify(result, null, 2))
await writeFile(`${runtime}-result-${size}.json`, JSON.stringify(result, null, 2) + "\n")
