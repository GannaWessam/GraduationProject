const { User, Permission } = require("../models");
const ApiResponse = require("../Util/ApiResponse");

const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.userData?.id;

      if (!userId) {
        return res
          .status(401)
          .json(new ApiResponse(false, "Unauthorized", null, ["unauthorized"]));
      }

      const permissionsArray = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const user = await User.findByPk(userId, {
        include: {
          model: Permission,
          as: "permissions",
          attributes: ["name"],
        },
      });

      if (!user) {
        return res
          .status(401)
          .json(new ApiResponse(false, "User not found", null, ["user_not_found"]));
      }

      const userPermissions = user.permissions.map(p => p.name);

      //  OR logic 
      const hasPermission = permissionsArray.some(p =>
        userPermissions.includes(p)
      );

      if (!hasPermission) {
        return res.status(403).json(
          new ApiResponse(false, "Permission denied", null, [
            "permission_denied",
          ])
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = checkPermission;
