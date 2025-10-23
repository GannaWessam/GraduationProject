require('dotenv').config();
const { sequelize } = require('../models');


(async () => {
  try {
    await sequelize.authenticate(); // function bt-Test el connection

    // ****da mynf3sh ma3 el production lazm nstkkhdm migrations*****
    await sequelize.sync({ alter: true }); 

    console.log('✅ DB synced');
  } catch (e) {
    console.error('❌ DB Sync failed', e);
  }
})();

