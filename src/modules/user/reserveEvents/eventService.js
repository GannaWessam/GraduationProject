
const {getAvailableEventsForUser} = require('./helper/helper')


const getAvailableEventsForUserService = async (userId, productId) => {

    const events = getAvailableEventsForUser(userId , productId)

    return events
    
};


module.exports = { getAvailableEventsForUserService };