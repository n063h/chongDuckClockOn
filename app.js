// import xiaoai from './utils/xiaoai_service'
const xiaoai = require('./utils/xiaoai_service')
const net=require('./utils/net_service')
const Koa = require('koa2');
const cors = require('koa2-cors');
const router = require('koa-router')();
const Config = require('./config');

const app = new Koa();
var todayTaskFinished = false;

app.use(cors({
    origin: function (ctx) { //设置允许来自指定域名请求
        if (ctx.url === '/goods') {
            return '*'; // 允许来自所有域名请求
        }
        return '*';
    },
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
}))



app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});
  


router.get('/say', async (ctx, next) => {
    await next();
    const words = ctx.request.query.words.split(' ');
    let ret={words:words}
    await eventQueue(xiaoai.say, 1e3 * 15, words);
    ctx.response.body = JSON.stringify(ret);
});

router.get('/finishTask', async (ctx, next) => {
    await next();
    let ret={status:'success'}
    await finishTask();
    ctx.response.body = JSON.stringify(ret);
});



app.use(router.routes());
const server=app.listen(Config.koa_port);
server.setTimeout(0)
console.log(`app started at port ${Config.koa_port}...`);

const eventQueue=(callback,timeout,array)=>{
    return new Promise((reslove, reject) => {
        let ind = 0;
        const i = setInterval(async () => { await callback(array[ind++]) }, timeout);
        setTimeout(() => { clearInterval(i); reslove(); }, (array.length + 1) * timeout)
    });
}


const finishTask = async () => {
    let tasks;
    let failed;
    try {
        console.log(`finishTask runs at ${new Date().toLocaleString()} `)
        if (todayTaskFinished)
            return;
        const page = await net.login();
        console.log('1',JSON.stringify(page._client))
        tasks = await net.getTask(page);
        console.log('2',JSON.stringify(tasks))
        failed = tasks.filter(task => task.status == '去完成');
        let words = failed.map(task => '天猫精灵,' + task.words);
        words.push('天猫精灵,停止');
        console.log(`words: ${JSON.stringify(words)}`)
        await eventQueue(xiaoai.say, 1e3 * 15, words);


        await net.reloadPage(page);
        tasks = await net.getTask(page);
        failed = tasks.filter(task => task.status == '去完成');
        if (failed.length == 0) {
            todayTaskFinished = true;
            net.sendMessage('成功');
        }
        else
            net.sendMessage(`失败` ,JSON.stringify(failed));
    } catch (e) {
        console.log(`error : ${JSON.stringify(e)}`)
        throw e;
        net.sendMessage('finishTask error',JSON.stringify(e));
    } finally {
        console.log(`tasks :${JSON.stringify(tasks)}\n failed :${JSON.stringify(failed)} `);
    }
}



setInterval(async() => {
    let now = new Date();
    if (now.getHours() == 0)
        todayTaskFinished = false;
    if (now.getHours() == 9 || now.getHours() == 21)
        await finishTask();
},1e3*60^60)