
const {getAvailableEventsForUser} = require('./helper/helper')


const getAvailableEventsForUserService = async (userId, productId,query) => {

    const events = getAvailableEventsForUser(userId , productId,query)

    return events
    
};


module.exports = { getAvailableEventsForUserService };