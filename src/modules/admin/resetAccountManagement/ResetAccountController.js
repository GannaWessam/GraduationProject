const { resetAccount } = require("./ResetAccountService");


const resetAccountController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, type } = req.body;

    if (!userId || !productId || !type) {
      return res.status(400).json({
        success: false,
        message: "userId, productId and type are required",
      });
    }

    const result = await resetAccount({
      userId,
      productId,
      type,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("resetAccountController error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to reset account",
    });
  }
};

module.exports = { resetAccountController };