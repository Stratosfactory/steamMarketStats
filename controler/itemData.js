const axios = require("axios")

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()



const getListings = async(config) => {
    try {
        let response = await axios.get("https://steamcommunity.com/market/search/render/?search_descriptions=0&sort_column=default&sort_dir=desc&appid=730&norender=1&count=100&query=case", config);

        return response.data.total_count
    } catch (err) {
        console.log(err)
    }
}




const compareListings = async(newListings) => {
    let prevListings = await prisma.listings.findMany({
        take: 2,
        orderBy: [{
                createdAt: 'desc',
            },

        ]
    })


    if ((newListings != prevListings[0].numberOfListing) || !prevListings[0].numberOfListing === undefined) {
        await prisma.listings.create({
            data: {
                numberOfListing: newListings
            }
        })
        return true
    } else {

        return false
    }
}

function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}


const fetchData = async(listings, config) => {
    try {
        let totalListing = listings

        console.log(totalListing)


        let itemArray = []
        const regEx = new RegExp('.Case$')


        for (i = 0; i <= totalListing; i += 100) {
            await delay(10000)
            let response = await axios.get(`https://steamcommunity.com/market/search/render/?start=${i}&count=100&search_descriptions=0&sort_column=default&sort_dir=desc&appid=730&norender=1&count=${i + 100}&query=case`, config);
            let items = response.data.results

            for (item of items) {
                if (regEx.test(item.name)) {
                    let itemObject = {
                        classid: item.asset_description.classid,
                        instanceid: item.asset_description.instanceid,
                        icon_url: item.asset_description.icon_url,
                        market_name: item.asset_description.market_name,
                        market_hash_name: item.asset_description.market_hash_name

                    }

                    itemArray.push(itemObject)
                }
            }

        }
        return itemArray
    } catch (err) {
        console.log(err)
    }
}

const compareFetchedData = (async(items) => {
    let dbResults = await prisma.items.findMany()
    let differences = items.filter(({ "market_hash_name": name1 }) => !dbResults.some(({ "market_hash_name": name2 }) => name2 === name1));
    return differences
})

const writeToDb = async(items) => {
    try {

        items.forEach(async(item) => {
            await prisma.items.create({
                data: item
            })
        })
        return true
    } catch (err) {
        console(err)
    }
}

async function getItemData(config) {
    const listings = await getListings(config)
    const newListings = await compareListings(listings)

    if (newListings) {
        const items = await fetchData(listings, config);
        const newItems = await compareFetchedData(items)
        const itemsToDB = await writeToDb(newItems)
        return itemsToDB
    } else {
        return true
    }


}



module.exports = { getItemData }