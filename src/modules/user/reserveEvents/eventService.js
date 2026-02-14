
const {getAvailableEventsForUser} = require('./helpers/helper')


const getAvailableEventsForUserService = async (userId, productId,query) => {

    const events = getAvailableEventsForUser(userId , productId,query)

    return events
    
};


module.exports = { getAvailableEventsForUserService };