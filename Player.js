const path = require('path');
const Finder = require('fs-finder');
const express = require('express')
const app = express()
const router = require('@kbco/router')(app);
const edge = require('edge.js')

edge.registerViews(path.join(__dirname, './views'))

module.exports = function () {
    let directory = this.argument('directory');
    if (!directory.startsWith('/')) {
        directory = process.cwd()  + '/' + directory;
    }
    
    let pathToIndex = path.normalize(directory)

    let files = Finder.from(pathToIndex).findFiles('*.mp4').map(file => {
        return {
            name: path.basename(file),
            path: file,
            encrypt: Buffer.from(file).toString('base64')
        }}).sort(function(a, b){
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
    });

    router.get('/', (req, res) => {
        return edge.render('welcome', { files });
    });
    
    router.get('/v/:id', (req, res) => {
        var file = path.resolve(Buffer.from(req.params.id, 'base64').toString('ascii'));
        fs.stat(file, function(err, stats) {
          if (err) {
            if (err.code === 'ENOENT') {
              // 404 Error if file not found
              return res.sendStatus(404);
            }
          res.end(err);
          }
          var range = req.headers.range;
          if (!range) {
           // 416 Wrong range
           return res.sendStatus(416);
          }
          var positions = range.replace(/bytes=/, "").split("-");
          var start = parseInt(positions[0], 10);
          var total = stats.size;
          var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
          var chunksize = (end - start) + 1;
    
          res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
          });
    
          var stream = fs.createReadStream(file, { start: start, end: end })
            .on("open", function() {
              stream.pipe(res);
            }).on("error", function(err) {
              res.end(err);
            });
        });
    });
    
    app.listen(3000, function() {
        console.log('Example app listening on port 3000!');
    });
}