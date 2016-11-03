import {ChildProcess} from 'child_process'


export interface Options {
    program?: string
    args?: string[]
    disable_console_logging?: boolean
    save_log?: boolean
    closeHandler?: (code: number) => void
    env?: {}
    startup_time?: number   // defaults to STARTUP_TIME_DEFAULT
    shutdown_time?: number   // defaults to SHUTDOWN_TIME_DEFAULT
}

export class ProcessSpawner {
    options: Options
    env: {}

    constructor(options: Options)
    start(): Promise<number>
    stop(): Promise<void>
}
