// 引入必要的模組
const { ofType } = require('redux-observable')
const { tap, catchError, switchMap, map, retryWhen, scan, delay } = require('rxjs/operators')
const { of, defer } = require('rxjs')
const axios = require('axios')

// 從 slice 中解構出 actions
const { fetchUser, fetchUserSuccess, fetchUserFailure } = require('../slices').remoteUser2Actions

// 定義重試次數與間隔
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1秒

// 定義 Epic 來處理 API 請求
const fetchUserEpic = (action$) =>
  action$.pipe(
    ofType(fetchUser), // 捕獲 fetchUser action
    tap(action => console.log('epics/fetchUsersEpic', action)),
    switchMap(action =>
      // 無法在node js使用rxjs/ajax, rxjs/ajax底層用了瀏覽器XMLHttpRequest
      defer(() => axios.get(`https://jsonplaceholder.typicode.com/users/${action.payload}`)).pipe(
        retryWhen(errors =>
          errors.pipe(
            tap(a => console.log('epics/fetchUsersEpic/errors', a.message)),
            scan((retryCount, err) => {
              if (retryCount >= MAX_RETRIES) throw err
              return retryCount + 1
            }, 0),
            delay(RETRY_DELAY)
          )
        ),
        map(res => fetchUserSuccess(res.data)),
        catchError(err => of(fetchUserFailure(err.message || '未知錯誤')))
      )
    )
  )

module.exports = fetchUserEpic
