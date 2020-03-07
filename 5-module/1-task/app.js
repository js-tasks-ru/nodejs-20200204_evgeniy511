const path = require("path");
const Koa = require("koa");
const app = new Koa();

app.use(require("koa-static")(path.join(__dirname, "public")));
app.use(require("koa-bodyparser")());

const Router = require("koa-router");
const router = new Router();

let subscribers = {};

router.get("/subscribe", async (ctx, next) => {
    const {r: id} = ctx.request.query;

    ctx.req.on("close", () => {
        delete subscribers[id];
    });

    const sPromise = new Promise((resolve, reject) => {
        subscribers[id] = {ctx, resolve};
    })

    await sPromise;
});

router.post("/publish", async (ctx, next) => {
    const { message } = ctx.request.body;

    for(id in subscribers) {
        const sub = subscribers[id];
        sub.ctx.body = message;
        sub.resolve();
    }
    subscribers = {};

    ctx.status = 200;
});

app.use(router.routes());

module.exports = app;
