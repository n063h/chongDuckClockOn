const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs/promises')
var Config=require('../config');


var browser = undefined;
const getBrowser=async(headless=true,sloMo=150)=> {
    try {
        if (browser == undefined)
        browser = await puppeteer.launch({
            headless: headless,
            slowMo: sloMo,
            ignoreDefaultArgs: ['--enable-automation'],
            args:['--no-sandbox']
        });
    await browser.userAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/89.0.4389.82')
    } catch (e) {
        console.log(e);
        console.log(`error :${JSON.stringify(e)}`)
    }
    return browser;
}

const login=async ()=>{
    var browser = await getBrowser()
    const page = await browser.newPage(false);
    await page.emulate(puppeteer.devices['iPhone 6']);
    // await page.setJavaScriptEnabled(false);
    await page.evaluateOnNewDocument(() => {
        const newProto = navigator.__proto__;
        delete newProto.webdriver;
        navigator.__proto__ = newProto;
    });
    try {
        await page.goto(Config.loginUrl, { timeout: 30000, waitUntil: 'networkidle0' });
        await page.type('#fm-login-id',Config.tMallUserName);
        await page.type('#fm-login-password',Config.tMallPassword);
        await page.click('.fm-submit');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        return page;
    } catch (e) {
        console.log(`error :${JSON.stringify(e)}`)
        throw Error('login error ',JSON.stringify(e))
    }
}

const getTask = async (page) => {
    const textContent = await page.$eval('#root', dom => dom.textContent);
    const tasks = textContent.match(/“.*?”.*?完成/g);
    return tasks.map(task => {
        return {
            words: task.match(/“(.*?)”/g)[0],
            status: task.match(/.完成/g)[0],
        }
    })
}

const sendMessage = async (status,msg) => {
    try {
        const pushUrl = `https://sc.ftqq.com/${Config.pushSecret}.send?text=${encodeURI('冲鸭打卡 : '+status)}&desp=${encodeURI(msg)}`;
        const res = await axios.get(pushUrl);
        
    } catch (e) {
        console.log(`sendMessage error : ${JSON.stringify(res.data)}\n Error:${JSON.stringify(e)}`);
    }   
}

const reloadPage = async (page) => {
    await page.reload({ waitUntil: 'networkidle0' });
    return page;
}


module.exports = {
    login,
    getTask,
    sendMessage,
    reloadPage
}