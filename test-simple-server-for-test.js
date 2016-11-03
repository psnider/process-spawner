var http = require('http');

const PORT = 7341; 



function shutdown(reason /* string | Error */) {
    var fname = 'shutdown'
    var succeeded = true
    if (typeof reason !== 'string') {
        succeeded = false
        //console.error(reason)
    } else {
        //console.log(reason)
    }
    process.exit(succeeded ? 0 : 1)
}


process.on('uncaughtException', shutdown)
process.on('SIGINT', () => {
    shutdown('Received SIGINT')
});
process.on('SIGTERM', () => {
    shutdown('Received SIGTERM')
});


function handleRequest(request, response){
    response.end('Something from the server');
}

var server = http.createServer(handleRequest);

server.listen(PORT, function() {
    //console.log(`Server listening on: http://localhost:${PORT}`);
});