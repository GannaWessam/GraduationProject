const {notification} = require("../../../models");

async function addNotification(userId , payload) {

    const{title , body} = payload;

    const notification = await Department.creat({userId , name: title , description:body });

    return{notification}

}

module.exports = {
    addNotification
};