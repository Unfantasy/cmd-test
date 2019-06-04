import 'whatwg-fetch';
import { hashHistory } from 'react-router';
import { message } from 'antd';
/* eslint-disable */
function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

/**
 * DATA数据处理
 * @param {*} data
 */
function getData(data){
    if(!data) {
        message.error("服务器返回数据NULL");
    }
    else {
        // 统一登录超时处理
        if(data && data.code === "SESSION_TIME_OUT"){
            // todo
            message.error(data.msg || "登录超时。。。");
            hashHistory.push('/login');

            return {};
        }
        if(data.code==="INVALID_TOKEN"){
            message.error(data.msg || "账号异地登录。。。");
            hashHistory.push('/login');
            return {};
        }
        // 成功后对出错的CODE统一处理
        if (data.code !== "SUCCESS") {
            message.error(data.msg || "请稍后重试。。。");
        }


    }

    return data;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const _options = { credentials: 'include', ...options };

  return fetch(url, _options)
    .then(checkStatus)
    .then(parseJSON)
    .then(getData)
    .catch(err => ({ err }));
}
