const SteamCommunity = require('steamcommunity');

let community = new SteamCommunity();



function steamLogin(accountName, password) {

    return new Promise(resolve => {

        community.login({
            accountName: accountName,
            password: password,

        }, (err, sessionID, cookies, steamguard) => {
            resolve(cookies)
        })


    })

}

async function getCookies(accountName, password) {
    try {
        let res = await steamLogin(accountName, password)
        return res
    } catch (err) {
        console.log(err)
    }
}






module.exports = { getCookies }