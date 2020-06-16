const Koa = require('koa')
const Router = require('koa-router')();
const bodyParser = require('koa-bodyparser')
var fs = require('fs')
const app = new Koa();
app.use(bodyParser());
Router.get('/', async (ctx, next) => {
    await ctx.render('index')
});
app.use(async (ctx, next) => {
    ctx.type = 'text/html;charset=utf-8'
    fs.readFile('./index.html', function (err, data) {
        if (err) {
            ctx.response.body = '文件读取失败，请稍后重试！'
        } else {
            console.log(data.toString())
            ctx.response.body = data.toString()
        }
        next();
    })
});

app.listen(3000)
console.log('server has start at http://localhost:3000');