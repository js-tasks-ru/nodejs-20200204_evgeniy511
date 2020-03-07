const path = require("path");
const Koa = require("koa");
const app = new Koa();

app.use(require("koa-static")(path.join(__dirname, "public")));
app.use(require("koa-bodyparser")());

const Router = require("koa-router");
const router = new Router();

let subscribers = [];

router.get("/subscribe", async (ctx, next) => {
    const sPromise = new Promise((resolve, reject) => {
        subscribers.push(resolve);
        ctx.req.on("close", () => {
            subscribers.splice(subscribers.indexOf(resolve), 1);
            const error = new Error("Connection closed");
            error.code = "CONNECTION_CLOSED";
            reject(error);
        });
    });

    let message

    try {
        message = await sPromise;
    } catch (err) {
        if (err.code === "CONNECTION_CLOSED") return;
        throw err;
    }

    ctx.body = message;
});

router.post("/publish", async (ctx, next) => {
    const { message } = ctx.request.body;

    if (!message) {
        ctx.throw(400);
    }

    subscribers.forEach(resolve => {
        resolve(message);
    });

    subscribers = [];

    ctx.status = 200;
});

app.use(router.routes());

module.exports = app;
