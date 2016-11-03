import fs                   = require('fs')
import request              = require('request')
import PATH                 = require('path')
import CHAI                 = require('chai')
const  expect               = CHAI.expect

import {ProcessSpawner} from './process-spawner'




describe('process-spawner', function() {

    describe('constructor', function() {

        it('should pass along env vars', function() {
            process.env['SOME_ENV_VAR'] = 'some value'
            let ps = new ProcessSpawner({
                program: 'node',
                args: ['some_program.js']
            })
            expect(ps.env['SOME_ENV_VAR']).to.equal('some value')
        })


        it('should override env vars from options.env', function() {
            process.env['SOME_ENV_VAR'] = 'some value'
            let ps = new ProcessSpawner({
                program: 'node',
                args: ['some_program.js'],
                env: {SOME_ENV_VAR: 'a different value'}
            })
            expect(ps.options.env['SOME_ENV_VAR']).to.equal('a different value')
        })

    })


    describe('start', function() {

        it('should return a promise that resolves when the process is ready', function() {
            let ps = new ProcessSpawner({
                program: 'node',
                args: ['test-finishes-immediately.js']
            })
            var ready_promise = ps.start()
            return ready_promise
        })


        it('should run the process', function(done) {
            let ps = new ProcessSpawner({
                program: 'node',
                args: ['test-simple-server-for-test.js']
            })
            var promises = ps.start()
            promises.ready.then(() => {
                request.get('http://localhost:7341', (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        expect(body).to.equal('Something from the server')
                    } else {
                        if (!error) {
                            error = new Error(`response.statusCode=${response.statusCode}`)
                        }
                    }
                    ps.stop().then(() => {
                        done(error)
                    })
                })
            })
        })


        describe('completion_promise', function() {

            it('should resolve if the completion code is 0', function() {
                let ps = new ProcessSpawner({
                    program: 'node',
                    args: ['test-finishes-immediately.js']
                })
                var promises = ps.start()
                return promises.completed.then((exit_code) => {
                    expect(exit_code).to.equal(0)
                })
            })


            it('should reject if the completion code is not 0', function() {
                let ps = new ProcessSpawner({
                    program: 'node',
                    args: ['test-finishes-immediately.js', '2']
                })
                var promises = ps.start()
                return promises.completed.then(
                    (exit_code) => {
                        throw new Error('expected rejection')
                    }, (error) => {
                        expect(error.exit_code).to.equal(2)
                        return
                    }
                )
            })

        })

    })


    describe('stop', function() {

        it('should return a promise that resolves when the process has stopped', function(done) {
            let ps = new ProcessSpawner({
                program: 'node',
                args: ['test-simple-server-for-test.js']
            })
            var promises = ps.start()
            promises.ready.then(() => {
                ps.stop().then(() => {
                    done()
                })
            })
        })

    })

})
