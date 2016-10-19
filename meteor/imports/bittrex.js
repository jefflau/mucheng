import 'fetch-everywhere'

const getLatestOrders = (market, limit) =>
  fetch(`https://bittrex.com/api/v1.1/public/getorderbook?market=${market}&type=both&depth=${limit}`)
    .then(res => res.json())
    .then(data => ({
      buy: data.result.buy.slice(0, limit),
      sell: data.result.sell.slice(0, limit)
    }))
    .catch(console.log)

const getMarketSummary = (market) =>
  fetch(`https://bittrex.com/api/v1.1/public/getmarketsummary?market=${market}`)
    .then(res => res.json())
    .then(data => ({
      ...data.result[0]
    }))
    .catch(console.log)

const averager = (a, c) => a + c.Rate
const weightedAverager = (a, c) => a + c.rate * c.weight

const calcAverage = (market, limit) =>
  getLatestOrders(market, limit).then(({ buy, sell }) => ({
    buy: buy.reduce(averager, 0)/limit,
    sell: sell.reduce(averager, 0)/limit
  }))

const calcWeightedAverage = (market, limit) =>
  getLatestOrders(market, limit).then(({ buy, sell }) => {
    let totalVolumeB = buy.reduce((a, c) => a + c.Quantity, 0)
    let totalVolumeS = sell.reduce((a, c) => a + c.Quantity, 0)
    let buyWeight = buy.map(o => ({ weight: o.Quantity/totalVolumeB, rate: o.Rate}))
    let sellWeight = sell.map(o => ({ weight: o.Quantity/totalVolumeS, rate: o.Rate}))

    return {
      buy: buyWeight.reduce(weightedAverager, 0),
      sell: sellWeight.reduce(weightedAverager, 0)
    }
  })

const calculateOrderVolume = (market, limit) =>
  getLatestOrders(market, limit).then(({ buy, sell }) => {
    let totalVolumeB = buy.reduce((a, c) => a + c.Quantity, 0)
    let totalVolumeS = sell.reduce((a, c) => a + c.Quantity, 0)
    let buyWeight = buy.map(o => ({ weight: o.Quantity/totalVolumeB, rate: o.Rate}))
    let sellWeight = sell.map(o => ({ weight: o.Quantity/totalVolumeS, rate: o.Rate}))

    return {
      buy: buyWeight.reduce(weightedAverager, 0),
      sell: sellWeight.reduce(weightedAverager, 0)
    }
  })

const sumOfLastOrders = (market, limit) =>
  getLatestOrders(market, limit).then(({ buy, sell }) => {
    return {
      buy: buy.reduce((a, c) => a + c.Quantity * c.Rate, 0),
      sell: sell.reduce((a, c) => a + c.Quantity * c.Rate, 0)
    }
  });

const calcSpread = (market) =>
  getBidAsk(market).then(d => (d.ask - d.bid) / d.bid * 100)

const getBidAsk = (market) =>
  getMarketSummary(market).then(data => ({ bid: data.Bid, ask: data.Ask}))

const marketSummary = (market, limit) => {
  console.log(`Summary of ${market}`)
  //getLatestOrders('btc-nlg', 10).then(console.log)
  getBidAsk(market).then(data => {
    console.log('Current Bid:', data.bid)
    console.log('Current Ask:', data.ask)
  })
  sumOfLastOrders(market, limit).then(data => {
    console.log(`Volume of last ${limit} bids`, data.buy, 'BTC')
    console.log(`Volume of last ${limit} asks`, data.sell, 'BTC')
  })
  calcWeightedAverage(market, limit).then(data => {
    console.log(`Weighted average of last ${limit} buy bids`, data.buy, 'BTC')
    console.log(`Weighted average of last ${limit} sell asks`, data.sell, 'BTC')
  })
  calcSpread(market).then(spread => {
    console.log('Spread: ', spread + '%')
  })
  // calcAverage('btc-nlg', limit).then((data) => {
  //   console.log('Average of buy bids', data.buy, 'BTC')
  //   console.log('Average of sell asks', data.sell, 'BTC')
  // })
  // getMarketSummary(market).then(console.log)
}

marketSummary('btc-nlg', 20)
//
// getLatestOrders('btc-nlg', 10)
// sumOfLastOrders('btc-nlg', 10).then(console.log)
// calcWeightedAverage('btc-nlg', 50).then(console.log)
// calcAverage('btc-nlg', 50).then(console.log)
// getMarketSummary('btc-nlg').then(console.log)
