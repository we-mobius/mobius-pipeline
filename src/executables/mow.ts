#!/usr/bin/env node

import { run } from './mow/run'

import type { Context } from './mow/mow.type'

// 读取命令行传递的参数
// 读取环境变量
// 读取程序默认配置信息
// 获得子命令，并将程序执行权、环境变量、程序默认配置信息交给子命令

const [execPath, execFilePath, ...execArguments] = process.argv
const context: Context = {
  execPath,
  execFilePath,
  execArguments
}
if (execArguments.length === 0) {
  console.log('At least one argument is required.')
}

const [command, ...commandArgs] = execArguments

if (command === 'run') {
  run({ args: commandArgs }, context)
}
