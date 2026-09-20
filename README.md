# Airstream `LazyList.foreach` benchmark

This repository provides a reproducible Scala.js benchmark for the change in [Airstream PR #167](https://github.com/raquo/Airstream/pull/167): removing the intermediate `LazyList.toList` before `foreach`.

The **before** bundle uses the old compatibility implementation; the **after** bundle calls `inputs.foreach(f)` directly. Both are compiled with Scala 3.9.0, Scala.js 1.22.0, sbt 1.10.7, and Java 25. GitHub Actions builds optimized (`fullOptJS`) bundles, runs scenarios for 16, 256, and 4096 elements, and uploads the generated JavaScript and JSON results.

The benchmark reports median wall-clock time over seven measured runs after three warmups. It is a focused algorithm comparison, not a complete Airstream application benchmark; bundle-size differences are standalone linker output.
