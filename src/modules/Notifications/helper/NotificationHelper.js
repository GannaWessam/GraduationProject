const { concatLang } = require("../../../Helpers/langHelper");
const {notification} = require("../../../models");

async function addNotification(userId , payload,translation) {

    const{title , body} = payload;
    const {title:t,body:b,type}=translation
    
    const res = await notification.create({userId , name: concatLang(title,t) , description:concatLang(body,b),type:type});

    return{res}

}

module.exports = {
    addNotification
};