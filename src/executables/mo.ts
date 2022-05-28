import {
  getCurrentWorkingDirectory, setCurrentWorkingDirectory,
  getCurrentFileFilename, getCurrentFileDirectory, getCurrentFilePath
} from '../taches/context/index'
import { runTypeScriptTransformer } from '../taches/run-typescript/index'

import { exec } from 'node:child_process'

// runTypeScriptTransformer({}, {}, {})
// console.log('gg1')
// exec('node ./src/text.ts', (error, stdout, stderr) => {
//   if (error != null) {
//     console.error(`exec error: ${error}`)
//     return
//   }
//   console.log(`stdout: ${stdout}`)
//   console.error(`stderr: ${stderr}`)
// })
// console.log('gg2')

// 读取命令行传递的参数
// 读取环境变量
// 读取程序默认配置信息
// 获得子命令，并将程序执行权、环境变量、程序默认配置信息交给子命令

// mobius run：
//

console.log('ggg')
console.log(getCurrentFileDirectory(import.meta))
