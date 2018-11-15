const fs = require('fs');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const Handlebars = require('handlebars');
const path = require('path');
const indexPath = path.join(__dirname, '../template/index.html');
const source = fs.readFileSync(indexPath);
const template = Handlebars.compile(source.toString());
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');



module.exports = async function (req, res, filePath, conf) {
    try {
        const stats = await stat(filePath);
        if(stats.isFile()) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            if(isFresh(stats, req, res)) {
                res.statusCode = 304;
                res.end()
                return;
            }

            let rs;
            let {code, start, end} = range(stats.size, req, res);
            if(code == 200) {
                rs = fs.createReadStream(filePath);
            }else {
                res.statusCode = 206;
                rs = fs.createReadStream(filePath, {start, end});
            }
            if(filePath.match(conf.compress)) {
                rs = compress(rs, req, res);
            }
            rs.pipe(res);
        }else if(stats.isDirectory()) {
            const files = await readdir(filePath);
            res.statusCode = 200;
            const dir = path.relative(conf.root, filePath);
            data = {
                title: path.basename(filePath),
                files,
                dir: dir ? '/'+dir:''
            }
            res.setHeader('Content-Type', 'text/html');
            res.end(template(data));
        }
    }catch(ex) {
        console.log(ex);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`file or directory is not found ${ex.toString()}`);
    }
}