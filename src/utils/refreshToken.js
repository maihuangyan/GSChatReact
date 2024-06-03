import useJwt from "./jwt/useJwt"
import { handleLogin } from "store/actions";

export function setTokenOverdueTime() {
    let t = new Date().getTime() + 600000;
    let d = new Date(t);
    let theMonth = d.getMonth() + 1;
    let theDate = d.getDate();
    let theHours = d.getHours();
    let theMinutes = d.getMinutes();
    if (theMonth < 10) {
        theMonth = '0' + theMonth
    }
    if (theDate < 10) {
        theDate = '0' + theDate
    }
    if (theHours < 10) {
        theHours = '0' + theHours
    }
    if (theMinutes < 10) {
        theMinutes = '0' + theMinutes
    }
    let date = d.getFullYear() + '-' + theMonth + '-' + theDate
    let time = theHours + ':' + theMinutes
    let Spare = date + ' ' + time
    return Spare;
}

function isTokenExpired() {
    let curTime = new Date();
    let tokenOverdueTime = localStorage.getItem("tokenOverdueTime");
    if (curTime > new Date(tokenOverdueTime)) {
        return true
    }
    return false;
}

let cacheRequestArr = [];
window.isRefreshing = false;

function cacheRequestArrHandle(cb) {
    cacheRequestArr.push(cb);
}

function afreshRequest(token) {
    cacheRequestArr.map(cb => cb(token));
    cacheRequestArr = [];
}

export function isRefreshToken(jwtConfig, config, store, accessToken ) {
    let url = config.url.endsWith(jwtConfig.refreshEndpoint) || config.url.endsWith(jwtConfig.loginEndpoint)
    if (isTokenExpired() && !url && accessToken ) {
        if (!window.isRefreshing) {
            window.isRefreshing = true;
            console.log(accessToken,"Refreshing token666")
            useJwt
                .refreshToken(accessToken).then(res => {
                    if (res.data.ResponseCode === 0) {
                        store.dispatch(handleLogin(res.data.ResponseResult));
                        localStorage.setItem("tokenOverdueTime", setTokenOverdueTime());
                        config.headers.Authorization = `${jwtConfig.tokenType} ${res.data.ResponseResult.access_token}`;

                        afreshRequest(res.data.ResponseResult.access_token);
                    }
                }).finally(() => {
                    window.isRefreshing = false;
                })
            let retry = new Promise((resolve) => {
                cacheRequestArrHandle((token) => {
                    config.headers.Authorization = `${jwtConfig.tokenType} ${token}`;
                    resolve(config)
                })
            })
            return retry;
        }
        else {
            let retry = new Promise((resolve) => {
                cacheRequestArrHandle((token) => {
                    config.headers.Authorization = `${jwtConfig.tokenType} ${token}`;
                    resolve(config)
                })
            })
            return retry;
        }
    }
    else {
        return config
    }
}
