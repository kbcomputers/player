const path = require('path');
const Finder = require('fs-finder');
const express = require('express');
const app = express();
const router = require('@kbco/router')(app);
const edge = require('edge.js');
const fs = require('fs');
edge.registerViews(path.join(__dirname, './views'))
app.use(express.static(path.join(__dirname, './public')));

module.exports = function () {
    if (!this.argument('directory')) {
        console.log('You must supply a directory as the first parameter.')
        process.exit();
    }
    
    let directory = this.argument('directory');
    if (!directory.startsWith('/')) {
        directory = process.cwd()  + '/' + directory;
    }
    
    let pathToIndex = path.normalize(directory)

    let files = Finder.from(pathToIndex).findFiles('*.mp4').map((file, id) => {
        let name = path.basename(file);
        
        let [showname1, showname2, episode] = name.split(' ');
        
        let friendly_name = name.split(' - ')[1].split('.')[0];
        
        return {
            id,
            name,
            path: file,
            showname: showname1 + ' ' + showname2,
            episode,
            encrypt: Buffer.from(file).toString('base64'),
            watched: false,
            friendly_name
        }}).sort(function(a, b){
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
        })
        .map((file, id_) => {
            return Object.assign(file, {id_});
        })

    router.get('/', (req, res) => {
        return edge.render('welcome', { files: JSON.stringify(files) });
    });
    router.post('update/:id', (req, res) => {
        for(file in files) {
            if (files[file].id == req.params.id) {
                files[file].watched = true;
            }
        }
        
        return [];
    });
    
    app.get('/v/:id', (req, res) => {
        var file = path.resolve(Buffer.from(req.params.id, 'base64').toString('ascii'));
        var stat = fs.statSync(file);
        var total = stat.size;
        if (req.headers['range']) {
            var range = req.headers.range;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];
        
            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total-1;
            var chunksize = (end-start)+1;
        
            var file = fs.createReadStream(file, {start: start, end: end});
            res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
            file.pipe(res);
        } else {
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
            fs.createReadStream(file).pipe(res);
        }
    });
    
    let port = this.option('port')[0] || 3000;
    
    app.listen(port, function() {
        console.log('Player listening on port ' + port);
    });
}