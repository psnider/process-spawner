# process-spawner

## Summary
Spawn a process, with some common control options.

## Usage

See the [tests](./process-spawner.tests.ts)

Here is an example from the "should run the process" test:
```
var request = require('request')
var process_spawner = require('./process-spawner')
var ProcessSpawner = process_spawner.ProcessSpawner

let ps = new ProcessSpawner({
    program: 'node',
    args: ['test-simple-server-for-test.js']
})
var promises = ps.start()
promises.ready.then(() => {
    request.get('http://localhost:7341', (error, response, body) => {
        if (!error && response.statusCode == 200) {
            console.log(body)
        } else {
            if (!error) {
                error = new Error(`response.statusCode=${response.statusCode}`)
            }
            console.log(`error=${error}`)
        }
        ps.stop().then(() => {
            console.log('stopped the process')
        })
    })
})
```


## Setup for Build
```
npm install
```

## Build
Build the software:  
```
npm run build
```

Remove the generated files:
```
npm run clean
```

## Test
Run the tests:  
```
npm run test
```

## Problems?
Please report them as issues on the GitHub repo.
