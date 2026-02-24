import path from 'node:path'

class EnvPaths {
  private readonly _electronUserDataPath: string
  private readonly _userDataPath: string
  private readonly _logPath: string
  private readonly _preferencesPath: string
  private readonly _dataCenterPath: string
  private readonly _preferencesFilePath: string

  constructor(userDataPath: string) {
    const currentDate = new Date()
    if (!userDataPath) {
      throw new Error('"userDataPath" is not set.')
    }

    this._electronUserDataPath = userDataPath // path.join(userDataPath, 'electronUserData')
    this._userDataPath = userDataPath
    this._logPath = path.join(this._userDataPath, 'logs', `${currentDate.getFullYear()}${currentDate.getMonth() + 1}`)
    this._preferencesPath = userDataPath // path.join(this._userDataPath, 'preferences')

    this._dataCenterPath = userDataPath

    this._preferencesFilePath = path.join(this._preferencesPath, 'preference.json')

    // TODO(sessions): enable this...
    // this._globalStorage = path.join(this._userDataPath, 'globalStorage')
    // this._preferencesPath = path.join(this._userDataPath, 'preferences')
    // this._sessionsPath = path.join(this._userDataPath, 'sessions')
  }

  get electronUserDataPath(): string {
    // This path is identical to app.getPath('userData') but userDataPath must not necessarily be the same path.
    return this._electronUserDataPath
  }

  get userDataPath(): string {
    return this._userDataPath
  }

  get logPath(): string {
    return this._logPath
  }

  get preferencesPath(): string {
    return this._preferencesPath
  }

  get dataCenterPath(): string {
    return this._dataCenterPath
  }

  get preferencesFilePath(): string {
    return this._preferencesFilePath
  }
}

export default EnvPaths
