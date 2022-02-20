const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const axios = require("axios");



const fetchPriceData = async(item, config) => {
    try {

        let response = await axios.get(`https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name=${item.market_hash_name}`, config);

        if (response) {
            let prices = response.data.prices
            let lastPrices = prices.slice(prices.length - 50, prices.length - 1)
            let yesterDay = new Date(prices[response.data.prices.length - 1][0]) - (24 * 60 * 60 * 1000)
            let totalItemsSold = 0
            let averagePrice = 0
            let entryCount = 0

            for (el of lastPrices) {
                if (new Date(el[0]).toLocaleDateString() === new Date(yesterDay).toLocaleDateString()) {
                    totalItemsSold += parseInt(el[2])
                    entryCount += 1

                    averagePrice += el[1]
                }
            }




            averagePrice = (averagePrice / entryCount)

            item["averagePrice"] = averagePrice
            item["soldItems"] = totalItemsSold

            return item
        }
    } catch (err) {
        console.log(err)
    }

}

const getItemsFromDB = (async() => {
    try {
        let items = await prisma.items.findMany()

        return items
    } catch (err) {
        console.log(err)
    }
})

const writeToDb = (async(itemMarketData) => {
    try {
        await prisma.marketData.create({
            data: itemMarketData
        })
    } catch (err) {
        console.log(err)
    }
})

async function getMarketData(config) {

    let items = await getItemsFromDB()

    items.forEach(async(item) => {
        let itemMarketData = await fetchPriceData(item, config)

        await writeToDb(itemMarketData)
    })
}


module.exports = { getMarketData }