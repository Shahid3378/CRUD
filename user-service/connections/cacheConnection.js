const NodeCache = require('node-cache')
const cache = new NodeCache({
    stdTTL : 600, // 10 min
    checkperiod : 120, // checking the cache every 120 sec for expired keys
    useClones: false
})

module.exports = {cache}