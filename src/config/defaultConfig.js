module.exports = {
    root: process.cwd(),
    port: 8070,
    hostname: '127.0.0.1',
    compress: /\.(html|js|css|json|md)/,
    cache: {
        maxAge: 6,
        expires: true,
        cacheControl: true,
        lastModified: true,
        etag: true,
    }
}