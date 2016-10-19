import 'fetch-everywhere'

const getLatestOrders = (limit) =>
  fetch(`https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-NLG&type=both&depth=${limit}`)
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

const calcAverage = (limit) =>
  getLatestOrders(limit).then(({ buy, sell }) => ({
    buy: buy.reduce(averager, 0)/limit,
    sell: sell.reduce(averager, 0)/limit
  }))

const calcWeightedAverage = (limit) =>
  getLatestOrders(limit).then(({ buy, sell }) => {
    let totalVolumeB = buy.reduce((a, c) => a + c.Quantity, 0)
    let totalVolumeS = sell.reduce((a, c) => a + c.Quantity, 0)
    let buyWeight = buy.map(o => ({ weight: o.Quantity/totalVolumeB, rate: o.Rate}))
    let sellWeight = sell.map(o => ({ weight: o.Quantity/totalVolumeS, rate: o.Rate}))

    return {
      buy: buyWeight.reduce(weightedAverager, 0),
      sell: sellWeight.reduce(weightedAverager, 0)
    }
  })

const calculateOrderVolume = (limit) =>
  getLatestOrders(limit).then(({ buy, sell }) => {
    let totalVolumeB = buy.reduce((a, c) => a + c.Quantity, 0)
    let totalVolumeS = sell.reduce((a, c) => a + c.Quantity, 0)
    let buyWeight = buy.map(o => ({ weight: o.Quantity/totalVolumeB, rate: o.Rate}))
    let sellWeight = sell.map(o => ({ weight: o.Quantity/totalVolumeS, rate: o.Rate}))

    return {
      buy: buyWeight.reduce(weightedAverager, 0),
      sell: sellWeight.reduce(weightedAverager, 0)
    }
  })


// calcWeightedAverage(50).then(console.log)
// calcAverage(50).then(console.log)
getMarketSummary('btc-nlg').then(console.log)
