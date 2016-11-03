"use strict";
var child_process = require('child_process');
var STARTUP_TIME_DEFAULT = 1000;
var SHUTDOWN_TIME_DEFAULT = 100;
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
var ProcessSpawner = (function () {
    function ProcessSpawner(options) {
        this.options = options;
        if (this.options.startup_time == null)
            this.options.startup_time = STARTUP_TIME_DEFAULT;
        if (this.options.shutdown_time == null)
            this.options.shutdown_time = SHUTDOWN_TIME_DEFAULT;
        // if (this.options.save_log) {
        //     var timestamp = (new Date()).toISOString()
        //     var log_filename = `logs/people.${timestamp}.log`
        //     this.log_file = fs.openSync(log_filename, 'w')
        // }
        // copy the env, and then set any user env variables set in options
        this.env = {};
        Object.assign(this.env, process.env);
        if (options.env) {
            Object.assign(this.env, options.env);
        }
    }
    // return a Promise that resolves when the spawned process has initialized, and is ready for use. 
    // It resolves with another Promise that resolves when the spawned process completes successfully, or rejects when it completes with an error. 
    ProcessSpawner.prototype.start = function () {
        var _this = this;
        var completed = new Promise(function (resolve, reject) {
            _this.spawned_proc = child_process.spawn(_this.options.program, _this.options.args, { env: _this.env });
            _this.spawned_proc.stdout.on('data', function (data) {
                // if (this.options.save_log) {
                //     fs.write(this.log_file, data, (error) => {
                //         if (error) {
                //             console.log(`error=${error}`)
                //         }
                //     })
                // } else {
                if (!_this.options.disable_console_logging) {
                    console.log(data.toString());
                }
                // }
            });
            _this.spawned_proc.stderr.on('data', function (data) {
                // if (this.options.save_log) {
                //     fs.write(this.log_file, data, (error) => {
                //         if (error) {
                //             console.log(`error=${error}`)
                //         }
                //     })
                // } else {
                if (!_this.options.disable_console_logging) {
                    console.error(data.toString());
                }
                // }
            });
            var defaultCloseHandler = function (exit_code) {
                //console.log(`${this.options.program} exited with exit_code=${exit_code}`)
                // if (!this.options.disable_console_logging) {
                //     console.log(`${this.options.program} exited with code=${code}`)
                // }
                if (exit_code === 0) {
                    resolve(exit_code);
                }
                else {
                    var error = new Error("exited with exit_code=" + exit_code);
                    error['exit_code'] = exit_code;
                    reject(error);
                }
            };
            _this.spawned_proc.on('close', _this.options.closeHandler || defaultCloseHandler);
        });
        var ready = new Promise(function (resolve, reject) {
            // give server a chance to start up
            setTimeout(function () {
                resolve();
            }, _this.options.startup_time);
        });
        return { ready: ready, completed: completed };
    };
    ProcessSpawner.prototype.stop = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.spawned_proc.kill('SIGTERM');
            // give server a chance to shut down
            setTimeout(function () {
                resolve();
            }, _this.options.shutdown_time);
        });
    };
    return ProcessSpawner;
}());
exports.ProcessSpawner = ProcessSpawner;
//# sourceMappingURL=process-spawner.js.map