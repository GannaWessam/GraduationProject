require('dotenv').config();
const { sequelize } = require('../models');


(async () => {
  try {
    await sequelize.authenticate(); // function bt-Test el connection

    // ****da mynf3sh ma3 el production lazm nstkkhdm migrations*****
    await sequelize.sync({ alter: true }); //khleha true lw hghyar fe structure eltables(hyms7ha w y3ml mn elawal aw by-alter)

    console.log('✅ DB synced');
  } catch (e) {
    console.error('❌ DB Sync failed', e);
  }
})();
