import 'fetch-everywhere'
import moment from 'moment'

type Interval = 'minute' | 'hour' | 'day'

function gradCalc(open: number, close: number) {}

function percentageChange (obz) {
    var {open, close, time} = obz
    return {percChange: ((close - open) / close) * 100, time: time}
}

function getRawData(fsym: string, tsym: string, interval: Interval, limit: number) {

    var testUrl = `https://www.cryptocompare.com/api/data/histo${interval}/?e=CCCAGG&fsym=${fsym}&limit=${limit}&tsym=${tsym}`

    return fetch(testUrl, {method: 'GET'})
        .then(res => res.json())
        .catch(console.log)
}

function consFive (a, c, currentIndex, array) {
    if (c.percChange > 5) {
        if (currentIndex > 0 && array[currentIndex - 1].percChange < 5) {
           a.push([])
        }
        if (currentIndex == 0) {
            a.push([])
        }
        a[a.length - 1].push(c)
    }
    return a
}


function findStreaks(){
  getRawData('ETH', 'USD', 'day', 365)
      .then(res => res.Data)
      .then(data => data.map(percentageChange))
      .then(percData => percData.reduce(consFive, []))
      .then(streaks => streaks.filter(streak => streak.length >= 5))
      .then(streaks => streaks.map(a => a.map(b => ({...b, humanTime: moment.unix(b.time).format("DD/MM/YYYY")}))))
      .then(console.log)
}
