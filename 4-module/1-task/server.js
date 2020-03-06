const url = require("url");
const http = require("http");
const path = require("path");
const fs = require("fs");

const server = new http.Server();

server.on("request", (req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname.slice(1);
    if (pathname.split("/").length > 1 || !pathname) {
        res.statusCode = 400;
        res.end("Bad request");
    }
    const filePath = path.join(__dirname, "files", pathname);
    switch (req.method) {
        case "GET":
            const stream = fs.createReadStream(filePath);

            res.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": "attachment; filename=" + pathname
            });

            stream.on("error", error => {
                res.writeHead(404, "Not found");
                res.end();
            });
            stream.pipe(res);
            break;
        default:
            res.statusCode = 501;
            res.end("Not implemented");
    }
});

module.exports = server;
