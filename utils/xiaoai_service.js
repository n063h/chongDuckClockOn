const fs = require('fs/promises')
const Config = require('../config')
const XiaoAi = require('xiaoai-tts')
let client = null


const login = async () => {
    try {
        // 尝试读取本地 Session 信息
        const Session = await fs.readFile('session', { encoding: 'utf8' })
        // 通过 Session 登录
        client = new XiaoAi(JSON.parse(Session))
      } catch (e) {
        client = new XiaoAi(Config.miUserName, Config.miPassword)
        const Session = await client.connect()
        // 将 Session 储存到本地
        await fs.writeFile('session', JSON.stringify(Session))
    }
}

const say = async (words) => {
    try {
        if (client == null)
            await login();
        await client.say(words);
    } catch (e) {
        throw Error('client say error\n',JSON.stringify(e))
    }
}

module.exports = {
    say
}