// ya ema ta3ml try/catch fe kol route, 3lshan nmsk el errors
// aw tst5dm wrapper zay catchError, howa bymsk el errors w tare2a ashal w sabta le kollo
// bstkhdmo as a middleware lel mthods bdal ma '3od a3ml catch gwa kol method
const catchError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
module.exports = catchError;
