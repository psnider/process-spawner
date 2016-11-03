"use strict";
var request = require('request');
var CHAI = require('chai');
var expect = CHAI.expect;
var process_spawner_1 = require('./process-spawner');
describe('process-spawner', function () {
    describe('constructor', function () {
        it('should pass along env vars', function () {
            process.env['SOME_ENV_VAR'] = 'some value';
            var ps = new process_spawner_1.ProcessSpawner({
                program: 'node',
                args: ['some_program.js']
            });
            expect(ps.env['SOME_ENV_VAR']).to.equal('some value');
        });
        it('should override env vars from options.env', function () {
            process.env['SOME_ENV_VAR'] = 'some value';
            var ps = new process_spawner_1.ProcessSpawner({
                program: 'node',
                args: ['some_program.js'],
                env: { SOME_ENV_VAR: 'a different value' }
            });
            expect(ps.options.env['SOME_ENV_VAR']).to.equal('a different value');
        });
    });
    describe('start', function () {
        it('should return a promise that resolves when the process is ready', function () {
            var ps = new process_spawner_1.ProcessSpawner({
                program: 'node',
                args: ['test-finishes-immediately.js']
            });
            var ready_promise = ps.start();
            return ready_promise;
        });
        it('should run the process', function (done) {
            var ps = new process_spawner_1.ProcessSpawner({
                program: 'node',
                args: ['test-simple-server-for-test.js']
            });
            var promises = ps.start();
            promises.ready.then(function () {
                request.get('http://localhost:7341', function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        expect(body).to.equal('Something from the server');
                    }
                    else {
                        if (!error) {
                            error = new Error("response.statusCode=" + response.statusCode);
                        }
                    }
                    ps.stop().then(function () {
                        done(error);
                    });
                });
            });
        });
        describe('completion_promise', function () {
            it('should resolve if the completion code is 0', function () {
                var ps = new process_spawner_1.ProcessSpawner({
                    program: 'node',
                    args: ['test-finishes-immediately.js']
                });
                var promises = ps.start();
                return promises.completed.then(function (exit_code) {
                    expect(exit_code).to.equal(0);
                });
            });
            it('should reject if the completion code is not 0', function () {
                var ps = new process_spawner_1.ProcessSpawner({
                    program: 'node',
                    args: ['test-finishes-immediately.js', '2']
                });
                var promises = ps.start();
                return promises.completed.then(function (exit_code) {
                    throw new Error('expected rejection');
                }, function (error) {
                    expect(error.exit_code).to.equal(2);
                    return;
                });
            });
        });
    });
    describe('stop', function () {
        it('should return a promise that resolves when the process has stopped', function (done) {
            var ps = new process_spawner_1.ProcessSpawner({
                program: 'node',
                args: ['test-simple-server-for-test.js']
            });
            var promises = ps.start();
            promises.ready.then(function () {
                ps.stop().then(function () {
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=process-spawner.tests.js.map