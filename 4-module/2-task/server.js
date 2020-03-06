const url = require("url");
const http = require("http");
const path = require("path");
const fs = require("fs");
const LimitSizeStream = require("./LimitSizeStream");

const server = new http.Server();

server.on("request", (req, res) => {
    const pathname = url.parse(req.url).pathname.slice(1);

    const filePath = path.join(__dirname, "files", pathname);

    if (pathname.split("/").length > 1 || !pathname) {
        res.statusCode = 400;
        return res.end("Bad request");
    }

    if (fs.existsSync(filePath)) {
        res.writeHead(409, "File exist");
        return res.end();
    }

    switch (req.method) {
        case "POST":
            const wStream = fs.createWriteStream(filePath);
            wStream.on("error", error => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                res.writeHead(500, "Server error");
                res.end();
            });
            wStream.on("finish", () => {
                res.writeHead(201, "OK");
                res.end();
            });
            const limitStream = new LimitSizeStream({ limit: 1048576 });
            limitStream.on("error", error => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                res.writeHead(413, "File size more than 1mb");
                res.end();
            });
            req.on("aborted", () => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
            req.pipe(limitStream).pipe(wStream);

            break;
        default:
            res.statusCode = 501;
            res.end("Not implemented");
    }
});

module.exports = server;
