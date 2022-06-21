/*
机场签到-glados
cron: 10 0,12 * * *

机场自动签到，白嫖机场，速度还不错
抓 glados.rocks 中的 cookie
变量名：glados_cookie

多个账号用 换行 或 @ 分割

前30天每天签到必得一天续期，之后签到概率为33%获得续期一天

机场网站：https://glados.rocks/
邀请码：OYWWX-FNAOI-INZPA-1MY94

@仟仟
 */
const {axios} = require('./utils/axiosConfig')

const $ = new Env('机场签到-glados');
let userCookie = process.env.glados_cookie || ``;
let userList = []
let envSplit = ['\n', '@']
let userCount = 0

!(async () => {
    if (!(await checkEnv())) return;
    let i = 1
    for (let item of userList) {
        try {
            await getUserInfo(item)
            await checkin(item)
            i++
        } catch (err) {
            console.log(err)
            console.log(`账号[ ${i} ]运行失败，开始下一个账号`)
        }
    }
    await $.showMsg()
})().catch((e) => console.log(e))
    .finally(() => $.done())


async function checkin(cookie) {
    let url = "https://glados.rocks/api/user/checkin"
    let res = await axios.post(url, {token: "glados.network"}, {headers: {"Cookie": cookie}})
    if (!res) return;
    if (res.code == 0) {
        $.logAndNotify("签到成功：" + res.message)
        $.logAndNotify(`已签到：${res.list.length} 天`)
    } else {
        $.logAndNotify(`签到失败：${res.message}`)
    }

}

async function getUserInfo(cookie) {
    let url = "https://glados.rocks/api/user/status"
    let res = await axios.get(url, {headers: {"Cookie": cookie}})
    if (!res) return;
    if (res.code === 0) {
        $.logAndNotify(`\n\n===============================`)
        $.logAndNotify(`当前账号：${res.data.email}`)
        $.logAndNotify(`剩余天数：${res.data.days} 天`)
        $.logAndNotify(`流量情况：${(res.data.traffic / 1024 / 1024 / 1024).toFixed(2)} GB /  ${res.data.vip} GB`)
    }
}

async function checkEnv() {
    if (userCookie) {
        let split = envSplit[0];
        for (let sp of envSplit) {
            if (userCookie.indexOf(sp) > -1) {
                split = sp;
                break;
            }
        }
        for (let userCookies of userCookie.split(split)) {
            if (userCookies) userList.push(userCookies)
        }
        userCount = userList.length

    } else {
        console.log('未找到CK')
    }
    console.log(`共找到${userCount}个账号`)
    return true
}


function Env(name, env) {
    return new class {
        constructor(name, env) {
            this.name = name
            this.notifyStr = ''
            this.startTime = (new Date).getTime()
            Object.assign(this, env)
            console.log("", `🔔${this.name}, 开始!`)
        }


        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
                    r = s ? this.getval(s) : "";
                if (r)
                    try {
                        const t = JSON.parse(r);
                        e = t ? this.lodash_get(t, i, "") : e
                    } catch (t) {
                        e = ""
                    }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
                    o = this.getval(i),
                    h = i ? "null" == o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t),
                        s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t),
                        s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }


        async showMsg() {
            if (!this.notifyStr) return;
            let notifyBody = this.name + " 运行通知\n\n" + this.notifyStr
            let notify = require('./sendNotify');
            console.log('\n============== 推送 ==============')
            await notify.sendNotify(this.name, notifyBody);
        }

        logAndNotify(str) {
            console.log(str)
            this.notifyStr += str
            this.notifyStr += '\n'
        }

        getMin(a, b) {
            return ((a < b) ? a : b)
        }

        getMax(a, b) {
            return ((a < b) ? b : a)
        }

        padStr(num, length, padding = '0') {
            let numStr = String(num)
            let numPad = (length > numStr.length) ? (length - numStr.length) : 0
            let retStr = ''
            for (let i = 0; i < numPad; i++) {
                retStr += padding
            }
            retStr += numStr
            return retStr;
        }

        json2str(obj, encodeUrl = false) {
            let ret = []
            for (let keys of Object.keys(obj).sort()) {
                let v = obj[keys]
                if (v && encodeUrl) v = encodeURIComponent(v)
                ret.push(keys + '=' + v)
            }
            return ret.join('&');
        }

        str2json(str, decodeUrl = false) {
            let ret = {}
            for (let item of str.split('&')) {
                if (!item) continue;
                let kv = item.split('=')
                if (kv.length < 2) continue;
                if (decodeUrl) {
                    ret[kv[0]] = decodeURIComponent(kv[1])
                } else {
                    ret[kv[0]] = kv[1]
                }
            }
            return ret;
        }

        randomString(len, charset = 'abcdef0123456789') {
            let str = '';
            for (let i = 0; i < len; i++) {
                str += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return str;
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = ((new Date).getTime() - this.startTime) / 1e3;
            console.log("", `🔔${this.name}, 结束! 🕛 ${e} 秒`)
        }
    }(name, env)
}
