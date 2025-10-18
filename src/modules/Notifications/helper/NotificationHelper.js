const {notification} = require("../../../models");

async function addNotification(userId , payload) {

    const{title , body} = payload;

    const res = await notification.create({userId , name: title , description:body });

    return{res}

}

module.exports = {
    addNotification
};