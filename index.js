var Application = require('forge-cli');

Application.command('start {directory} {port}', require('./Player'));

let args = Object.assign({}, {args: process.argv});

// This "starts" the application
Application.start(args);
