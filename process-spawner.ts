import child_process = require('child_process')
import fs = require('fs')



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

const STARTUP_TIME_DEFAULT = 1000
const SHUTDOWN_TIME_DEFAULT = 100


/* 
** @example
var A_NODE_PROCESS_FILENAME = 't.js'
var ps = require('generated/tools/tools/ts/process-spawner.js')
var proc = new ps.ProcessSpawner({program: 'node', args: [A_NODE_PROCESS_FILENAME]})
var ready_promise = proc.start()
ready_promise.then((completion_promise) => {
    return completion_promise
}).then((code) => {
    console.log(`completion resolved with: ${code}`)    
})
proc.stop()
*/
export class ProcessSpawner {

    options: Options
    env: {}
    log_file: number
    spawned_proc: child_process.ChildProcess


    constructor(options: Options) {
        this.options = options
        if (this.options.startup_time == null) this.options.startup_time = STARTUP_TIME_DEFAULT
        if (this.options.shutdown_time == null) this.options.shutdown_time = SHUTDOWN_TIME_DEFAULT
        // if (this.options.save_log) {
        //     var timestamp = (new Date()).toISOString()
        //     var log_filename = `logs/people.${timestamp}.log`
        //     this.log_file = fs.openSync(log_filename, 'w')
        // }

        // copy the env, and then set any user env variables set in options
        this.env = {}
        Object.assign(this.env, process.env)
        if (options.env) {
            Object.assign(this.env, options.env)
        }
    }


    // return a Promise that resolves when the spawned process has initialized, and is ready for use. 
    // It resolves with another Promise that resolves when the spawned process completes successfully, or rejects when it completes with an error. 
    start(): {ready: Promise<void>, completed: Promise<number>} {
        var completed = new Promise<number>((resolve, reject) => {
            this.spawned_proc = child_process.spawn(this.options.program, this.options.args, {env: this.env})
            this.spawned_proc.stdout.on('data', (data) => {
                // if (this.options.save_log) {
                //     fs.write(this.log_file, data, (error) => {
                //         if (error) {
                //             console.log(`error=${error}`)
                //         }
                //     })
                // } else {
                    if (!this.options.disable_console_logging) {
                        console.log(data.toString())
                    }
                // }
            })
            this.spawned_proc.stderr.on('data', (data) => {
                // if (this.options.save_log) {
                //     fs.write(this.log_file, data, (error) => {
                //         if (error) {
                //             console.log(`error=${error}`)
                //         }
                //     })
                // } else {
                    if (!this.options.disable_console_logging) {
                        console.error(data.toString())
                    }
                // }
            })
            var defaultCloseHandler = (exit_code: number) => {
                //console.log(`${this.options.program} exited with exit_code=${exit_code}`)
                // if (!this.options.disable_console_logging) {
                //     console.log(`${this.options.program} exited with code=${code}`)
                // }
                if (exit_code === 0) {
                    resolve(exit_code)
                } else {
                    let error = new Error(`exited with exit_code=${exit_code}`)
                    error['exit_code'] = exit_code
                    reject(error)
                }
            }
            this.spawned_proc.on('close', this.options.closeHandler || defaultCloseHandler)
        })
        var ready = new Promise<void>((resolve, reject) => {
            // give server a chance to start up
            setTimeout(() => {
                resolve()
            }, this.options.startup_time)
        })
        return {ready, completed}
    }


    stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.spawned_proc.kill('SIGTERM')
            // give server a chance to shut down
            setTimeout(() => {
                resolve()
            }, this.options.shutdown_time)
        })
    }

}
