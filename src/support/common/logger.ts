import { ESM_LOADER_CONTEXT } from './context'

class Logger {
  private readonly _logger: typeof console
  private isOpen: boolean
  prefix: string[]

  constructor (logger: typeof console) {
    this._logger = logger
    this.isOpen = false
    this.prefix = []
  }

  open (): void {
    this.isOpen = true
  }

  setPrefix (prefix: string[]): void {
    this.prefix = prefix
  }

  log (...args: any[]): void {
    if (this.isOpen) {
      this._logger.log(...this.prefix, ...args)
    }
  }
}

export const LoggerForResolve = new Logger(console)
LoggerForResolve.setPrefix(['[ESMLoaderResolve]'])
if (ESM_LOADER_CONTEXT.ESMLoaderConfig.traceResolve) {
  LoggerForResolve.open()
}
