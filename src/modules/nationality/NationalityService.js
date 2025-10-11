const { Department, College ,Nationality } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const { Op } = require("sequelize");

async function getAllNationalityService() {
    const nationalities = await Nationality.findAll({
      order: [["Name", "ASC"]], 
    });
  
    return {
        status: 200,
        message: "Nationalities fetched successfully",
        data: nationalities,
      };
  }


module.exports = {
  getAllNationalityService,
  
};