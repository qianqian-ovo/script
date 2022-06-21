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
})().catch((e) => console.log(e))
    .finally(() => $.done())


async function checkin(cookie) {
    let url = "https://glados.rocks/api/user/checkin"
    let res = await axios.post(url, {token: "glados.network"}, {headers: {"Cookie": cookie}})
    if (!res) return;
    if (res.code == 0) {
        console.log("签到成功：" + res.message)
        console.log(`已签到：${res.list.length} 天`)
    } else {
        console.log(`签到失败：${res.message}`)
    }

}

async function getUserInfo(cookie) {
    let url = "https://glados.rocks/api/user/status"
    let res = await axios.get(url, {headers: {"Cookie": cookie}})
    if (!res) return;
    if (res.code === 0) {
        console.log(`\n\n============================================`)
        console.log(`当前账号：${res.data.email}`)
        console.log(`剩余天数：${res.data.days} 天`)
        console.log(`流量情况：${(res.data.traffic / 1024 / 1024 / 1024).toFixed(2)} GB /  ${res.data.vip} GB`)
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


function Env(t, e) {
    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let i = this.get;
            return "POST" === e && (i = this.post), new Promise(((e, r) => {
                i.call(this, t, ((t, i, n) => {
                    t ? r(t) : e(i)
                }))
            }))
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        isShadowrocket() {
            return "undefined" != typeof $rocket
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let i = e;
            if (this.getdata(t)) try {
                i = JSON.parse(this.getdata(t))
            } catch {
            }
            return i
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise((e => {
                this.get({url: t}, ((t, i, r) => e(r)))
            }))
        }

        runScript(t, e) {
            return new Promise((i => {
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                r = r ? r.replace(/\n/g, "").trim() : r;
                let n = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                n = n ? 1 * n : 20, n = e && e.timeout ? e.timeout : n;
                const [h, a] = r.split("@"), d = {
                    url: `http://${a}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: n},
                    headers: {"X-Key": h, Accept: "*/*"}
                };
                this.post(d, ((t, e, r) => i(r)))
            })).catch((t => this.logErr(t)))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    i = this.fs.existsSync(t), r = !i && this.fs.existsSync(e);
                if (!i && !r) return {};
                {
                    const r = i ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(r))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    i = this.fs.existsSync(t), r = !i && this.fs.existsSync(e), n = JSON.stringify(this.data);
                i ? this.fs.writeFileSync(t, n) : r ? this.fs.writeFileSync(e, n) : this.fs.writeFileSync(t, n)
            }
        }

        lodash_get(t, e, i) {
            const r = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let n = t;
            for (const t of r) if (n = Object(n)[t], void 0 === n) return i;
            return n
        }

        lodash_set(t, e, i) {
            return Object(t) !== t || (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce(((t, i, r) => Object(t[i]) === t[i] ? t[i] : t[i] = Math.abs(e[r + 1]) >> 0 == +e[r + 1] ? [] : {}), t)[e[e.length - 1]] = i), t
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(t), n = i ? this.getval(i) : "";
                if (n) try {
                    const t = JSON.parse(n);
                    e = t ? this.lodash_get(t, r, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let i = !1;
            if (/^@/.test(e)) {
                const [, r, n] = /^@(.*?)\.(.*?)$/.exec(e), h = this.getval(r),
                    a = r ? "null" === h ? null : h || "{}" : "{}";
                try {
                    const e = JSON.parse(a);
                    this.lodash_set(e, n, t), i = this.setval(JSON.stringify(e), r)
                } catch (e) {
                    const h = {};
                    this.lodash_set(h, n, t), i = this.setval(JSON.stringify(h), r)
                }
            } else i = this.setval(t, e);
            return i
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, ((t, i, r) => {
                !t && i && (i.body = r, i.statusCode = i.status), e(t, i, r)
            })); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then((t => {
                const {statusCode: i, statusCode: r, headers: n, body: h} = t;
                e(null, {status: i, statusCode: r, headers: n, body: h}, h)
            }), (t => e(t))); else if (this.isNode()) {
                let i = require("iconv-lite");
                this.initGotEnv(t), this.got(t).on("redirect", ((t, e) => {
                    try {
                        if (t.headers["set-cookie"]) {
                            const i = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                            i && this.ckjar.setCookieSync(i, null), e.cookieJar = this.ckjar
                        }
                    } catch (t) {
                        this.logErr(t)
                    }
                })).then((t => {
                    const {statusCode: r, statusCode: n, headers: h, rawBody: a} = t;
                    e(null, {status: r, statusCode: n, headers: h, rawBody: a}, i.decode(a, this.encoding))
                }), (t => {
                    const {message: r, response: n} = t;
                    e(r, n, n && i.decode(n.rawBody, this.encoding))
                }))
            }
        }

        post(t, e = (() => {
        })) {
            const i = t.method ? t.method.toLocaleLowerCase() : "post";
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient[i](t, ((t, i, r) => {
                !t && i && (i.body = r, i.statusCode = i.status), e(t, i, r)
            })); else if (this.isQuanX()) t.method = i, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then((t => {
                const {statusCode: i, statusCode: r, headers: n, body: h} = t;
                e(null, {status: i, statusCode: r, headers: n, body: h}, h)
            }), (t => e(t))); else if (this.isNode()) {
                let r = require("iconv-lite");
                this.initGotEnv(t);
                const {url: n, ...h} = t;
                this.got[i](n, h).then((t => {
                    const {statusCode: i, statusCode: n, headers: h, rawBody: a} = t;
                    e(null, {status: i, statusCode: n, headers: h, rawBody: a}, r.decode(a, this.encoding))
                }), (t => {
                    const {message: i, response: n} = t;
                    e(i, n, n && r.decode(n.rawBody, this.encoding))
                }))
            }
        }

        time(t, e = null) {
            const i = e ? new Date(e) : new Date;
            let r = {
                "M+": i.getMonth() + 1,
                "d+": i.getDate(),
                "H+": i.getHours(),
                "m+": i.getMinutes(),
                "s+": i.getSeconds(),
                "q+": Math.floor((i.getMonth() + 3) / 3),
                S: i.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (i.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in r) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? r[e] : ("00" + r[e]).substr(("" + r[e]).length)));
            return t
        }

        msg(e = t, i = "", r = "", n) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        return {
                            openUrl: t.openUrl || t.url || t["open-url"],
                            mediaUrl: t.mediaUrl || t["media-url"]
                        }
                    }
                    if (this.isQuanX()) {
                        return {
                            "open-url": t["open-url"] || t.url || t.openUrl,
                            "media-url": t["media-url"] || t.mediaUrl
                        }
                    }
                    if (this.isSurge()) {
                        return {url: t.url || t.openUrl || t["open-url"]}
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, i, r, o(n)) : this.isQuanX() && $notify(e, i, r, o(n))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), i && t.push(i), r && t.push(r), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        fwcaas() {
            return "aHR0cDovLzExOS45MS4yMjIuOTc="
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            !this.isSurge() && !this.isQuanX() && !this.isLoon() ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        fwur() {
            return (new FxPCnMKLw7).decode(this.fwcaas())
        }

        wait(t) {
            return new Promise((e => setTimeout(e, t)))
        }

        json2str(t, e = !1) {
            let i = [];
            for (let r of Object.keys(t).sort()) {
                let n = t[r];
                n && e && (n = encodeURIComponent(n)), i.push(r + "=" + n)
            }
            return i.join("&")
        }

        str2json(t, e = !1) {
            let i = {};
            for (let r of t.split("&")) {
                if (!r) continue;
                let t = r.split("=");
                t.length < 2 || (i[t[0]] = e ? decodeURIComponent(t[1]) : t[1])
            }
            return i
        }

        done(t = {}) {
            const e = ((new Date).getTime() - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${e} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
