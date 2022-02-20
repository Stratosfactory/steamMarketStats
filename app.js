//env Variables

require('dotenv').config()

const accountName = process.env.STEAM_ACCOUNT_NAME
const password = process.env.STEAM_ACCOUNT_PASSWORD

//load modules

const priceData = require("../steamMarketStats/controler/priceData")
const steamAuth = require("../steamMarketStats/controler/steamAuth")
const itemData = require("../steamMarketStats/controler/itemData")

async function itemDataApp() {
    const cookies = await steamAuth.getCookies(accountName, password)
    const loginToken = cookies[3]

    const config = {
        headers: {
            Cookie: loginToken
        }
    }

    itemData.getItemData(config);
    priceData.getMarketData(config)

}

itemDataApp()