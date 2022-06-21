let axios = require("axios")
let qs = require("qs")
axios.defaults.timeout = 60 * 1000 //设置请求超时时间，单位：毫秒
axios.defaults.retry = 3; //设置全局请求次数
axios.defaults.retryDelay = 30 * 1000;//设置全局请求间隙

// 请求拦截
axios.interceptors.request.use(
    function (config) {
        if (config.data && typeof config.data === "object") {
            config.data = qs.stringify(config.data); //转换数据，这里依赖qs模块，将json转param
            config.headers['Content-Length'] = config.data.length
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);
//   响应拦截
axios.interceptors.response.use(
    function (response) {
        return response.data;//这里只返回服务器给的数据到回调函数，
    },
    function (err) {
        let config = err.config;
        if (!config || !config.retry) return Promise.reject(err);
        // 设置用于跟踪重试次数的变量
        config.__retryCount = config.__retryCount || 0;
        // 检查我们是否已将重试总数最大化
        if (config.__retryCount >= config.retry) {
            // 错误拒绝
            return Promise.reject("网络错误，请检查网络。");
        }
        // 增加重试次数
        config.__retryCount += 1;
        if (config.__retryCount === 1) console.log("请求超时")
        console.log(`尝试重新请求${config.__retryCount}次`)
        let backoff = new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, config.retryDelay || 2000);
        });
        // 返回承诺，其中将撤回axios以重试请求
        return backoff.then(function () {
            return axios(config);
        });
    }
);

module.exports = {
    axios
};
