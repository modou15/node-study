const fs = require('fs');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

module.exports = async function (req, res, filePath) {
    try {
        const stats = await stat(filePath);
        if(stats.isFile()) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            fs.createReadStream(filePath).pipe(res);
        }else if(stats.isDirectory()) {
            const files = await readdir(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end(files.join(','));
        }
    }catch(ex) {
        console.log(ex);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`file or directory is not found ${ex.toString()}`);
    }
}