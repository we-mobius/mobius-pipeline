import * as path from 'node:path'
import * as fs from 'node:fs'

/**
 * Use `eval` to get the value of a JSON file.
 *
 * Q: Why use `eval` instead of JSON.parse()?
 *
 * A: Cause `eval` can parse the JSON file as JavaScript code,
 * which means it can contain comments.
 */
export const readJSONFileAsValue = (pathOfJSON: string): any => {
  const JSONString = fs.readFileSync(pathOfJSON, { encoding: 'utf8' })
  try {
    // eslint-disable-next-line no-eval
    return eval(`(${JSONString})`)
  } catch (error) {
    console.log(`[readJSONFileAsValue] failed: ${pathOfJSON}`)
    return undefined
  }
}

/**
 * Check if the targetPath refers to a top directory, which means it doesn't have any parent directory.
 */
export const isTopDirectory = (targetPath: string): boolean => {
  const normalizedTargetPath = path.normalize(targetPath)
  return normalizedTargetPath === path.dirname(normalizedTargetPath)
}

/**
 * Check if the targetPath refers to an exist directory.
 */
export const isExistDirectory = (targetPath: string): boolean => {
  return fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()
}
/**
 * Check if the targetPath refers to an exist file.
 */
export const isExistFile = (targetPath: string): boolean => {
  return fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()
}

/**
 * @param targetPath is expected to be an absolute path, whether it is a file or directory.
 * @param filenames an array of filenames to be searched, they will be searched in the order of the array.
 */
export const findResponsibleFilePath = (targetPath: string, filenames: string[]): string | undefined => {
  const normalizedTargetPath = path.normalize(targetPath)
  // 从目标文件所在目录开始，逐级上翻，直到找到一个目标文件名的文件
  const dirname = isExistDirectory(normalizedTargetPath) ? normalizedTargetPath : path.dirname(normalizedTargetPath)
  const assumedResponsibleFilePaths = filenames.map(filename => path.resolve(dirname, filename))
  const existResponsibleFilePath = assumedResponsibleFilePaths.find(
    assumedResponsibleFilePath => fs.existsSync(assumedResponsibleFilePath)
  )
  if (existResponsibleFilePath !== undefined) {
    return existResponsibleFilePath
  } else {
    // 已经是顶级目录了，没有找到就是没有
    if (isTopDirectory(normalizedTargetPath)) {
      return undefined
    } else {
      // 如果不是顶级目录，上翻一级
      return findResponsibleFilePath(path.dirname(dirname), filenames)
    }
  }
}
