import scala.scalajs.js

object LazyListForeachBench {
  private def foreachOptimized[A](inputs: Seq[A], f: A => Unit): Unit = {
    inputs.foreach(f)
  }

  private def run(size: Int, rounds: Int): Double = {
    val inputs = LazyList.from(0).take(size)
    var checksum = 0L
    var round = 0
    while (round < rounds) {
      foreachOptimized(inputs, value => checksum += value)
      round += 1
    }
    checksum.toDouble
  }

  def main(args: Array[String]): Unit = {
    val cliArgs = js.Dynamic.global.process.argv.asInstanceOf[js.Array[String]].toSeq
    val size = cliArgs.drop(2).headOption.map(_.toInt).getOrElse(256)
    val rounds = cliArgs.drop(3).headOption.map(_.toInt).getOrElse(1000)
    println(js.Dynamic.global.JSON.stringify(js.Dynamic.literal(
      size = size,
      rounds = rounds,
      checksum = run(size, rounds)
    )))
  }
}
