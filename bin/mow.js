#!/usr/bin/env node

// src/executables/mow/run.ts
import { spawn } from "child_process";
import { pathToFileURL } from "url";
import * as path from "path";
import * as process2 from "process";
var run = (options, context2) => {
  const { args } = options;
  if (args.length === 0) {
    console.log("[Run] At least one argument is required.");
  }
  const { execPath: execPath2, execFilePath: execFilePath2 } = context2;
  const [targetFilePath] = args;
  const processInstance = spawn(execPath2, [
    "--loader",
    pathToFileURL(path.resolve(execFilePath2, "../../dist/support/loader.js")).href,
    path.resolve(process2.cwd(), targetFilePath)
  ]);
  const ignoreWarnings = [
    "ExperimentalWarning: --experimental-loader is an experimental feature.",
    "This feature could change at any time"
  ];
  processInstance.stdout.pipe(process2.stdout);
  processInstance.stderr.on("data", (data) => {
    if (!ignoreWarnings.some((warning) => data.toString().includes(warning))) {
      process2.stderr.write(data, "utf8");
    }
  });
  processInstance.on("close", (code) => {
    process2.exit(code);
  });
};

// src/executables/mow.ts
var [execPath, execFilePath, ...execArguments] = process.argv;
var context = {
  execPath,
  execFilePath,
  execArguments
};
if (execArguments.length === 0) {
  console.log("At least one argument is required.");
}
var [command, ...commandArgs] = execArguments;
if (command === "run") {
  run({ args: commandArgs }, context);
}
