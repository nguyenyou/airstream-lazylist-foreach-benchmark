ThisBuild / scalaVersion := "3.9.0"
ThisBuild / version := "0.1.0"
ThisBuild / scalaJSStage := FullOptStage

lazy val commonSettings = Seq(
  scalaJSUseMainModuleInitializer := true,
  Compile / mainClass := Some("LazyListForeachBench")
)

lazy val before = project.in(file("before"))
  .enablePlugins(ScalaJSPlugin)
  .settings(commonSettings, name := "airstream-lazylist-foreach-before")

lazy val after = project.in(file("after"))
  .enablePlugins(ScalaJSPlugin)
  .settings(commonSettings, name := "airstream-lazylist-foreach-after")
