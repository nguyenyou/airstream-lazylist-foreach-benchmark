import { readFile } from "node:fs/promises"

const [, , beforePath, afterPath, ...resultPaths] = Bun.argv

const beforeSize = (await readFile(beforePath)).byteLength
const afterSize = (await readFile(afterPath)).byteLength
const delta = afterSize - beforeSize

const rows = await Promise.all(resultPaths.map(async path => {
  const result = JSON.parse(await readFile(path, "utf8"))
  return {
    size: result.size,
    beforeMs: result.before.medianMs,
    afterMs: result.after.medianMs,
    lessTime: result.lessTimePercent,
    throughput: result.throughputRatio,
    checksumMatches: result.before.result.checksum === result.after.result.checksum
  }
}))

rows.sort((left, right) => left.size - right.size)

console.log("## Runtime benchmark")
console.log("")
console.log("| LazyList size | Before median | After median | Less time | Throughput | Checksum |")
console.log("|---:|---:|---:|---:|---:|:---:|")
for (const row of rows) {
  console.log(`| ${row.size} | ${row.beforeMs.toFixed(2)} ms | ${row.afterMs.toFixed(2)} ms | ${row.lessTime.toFixed(1)}% | ${row.throughput.toFixed(2)}x | ${row.checksumMatches ? "yes" : "NO"} |`)
}

console.log("")
console.log("## Bundle size")
console.log("")
console.log(`- Before: ${beforeSize} bytes`)
console.log(`- After: ${afterSize} bytes`)
console.log(`- Delta: ${delta >= 0 ? "+" : ""}${delta} bytes`)
