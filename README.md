# [chongDuckClockOn](https://github.com/n063h/chongDuckClockOn)

# Description

平安冲鸭打卡.

白嫖小音箱,小爱required(音箱,不是猫).

详情请见:https://detail.tmall.com/item.htm?id=628468515434

直接用的Puppeteer,费点内存,省绕路时间.



## Quickstart

1. `yarn install`

2. 添加config.js到根目录

   ```
   {
       miUserName: '', //你的小米账号
       miPassword: '', //小米密码
       koa_port: 3001, //服务器端口,方便人工补打卡
       loginUrl:'https://market.m.taobao.com/app/forest/assets/comeon.html?gameId=14&share_target=copy_text', //网页端打卡页面
       tMallUserName: '', //阿里账号
       tMallPassword: '', //阿里密码
       pushSecret: '',	//[server酱](https://sct.ftqq.com/)密钥,为推送打卡记录到微信
   }
   ```
3. 修改koa.vbs里项目路径,添加到<启动>文件夹里以开机启动

4. `node app.js`

