const url = require("url");
const http = require("http");
const path = require("path");
const fs = require("fs");

const server = new http.Server();

server.on("request", (req, res) => {
    const pathname = url.parse(req.url).pathname.slice(1);

    const filePath = path.join(__dirname, "files", pathname);

    switch (req.method) {
        case "DELETE":
            if (pathname.split("/").length > 1 || !pathname) {
                res.statusCode = 400;
                return res.end("Bad request");
            }

            if (!fs.existsSync(filePath)) {
                res.writeHead(404, "File does not exist");
                return res.end();
            }

            fs.unlink(filePath, err => {
                if (err) {
                    res.writeHead(500, "Server error");
                    res.end();
                } else {
                    res.writeHead(200, "OK");
                    res.end();
                }
            });

            break;
        default:
            res.statusCode = 501;
            res.end("Not implemented");
    }
});

module.exports = server;
