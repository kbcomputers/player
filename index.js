var Application = require('forge-cli');

Application.command('start {directory}', require('./Player'));

let args = Object.assign({}, {args: process.argv});

// This "starts" the application
Application.start(args);
