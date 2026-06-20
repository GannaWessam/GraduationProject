
const {getAvailableEventsForUser} = require('./helpers/helper')


const getAvailableEventsForUserService = async (userId, productId,query ,isSuperAdmin) => {

    const events = getAvailableEventsForUser(userId , productId,query ,isSuperAdmin)

    return events
    
};


module.exports = { getAvailableEventsForUserService };