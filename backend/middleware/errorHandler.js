const { StatusCodes } = require('http-status-codes');

const errorHandler = (err, req, res, next)=>{

    let customError = {
        StatusCode : err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg : err.message || "Something went wrong , Please try again later !."
    }
    if (err.name === 'ValidationError') {
        customError.msg = err.message;
        customError.StatusCode = 400
      }
      if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(
          err.keyValue
        )} field, please choose another value`
        customError.StatusCode = 400
      }
      if (err.name === 'CastError') {
        customError.msg = `No item found with id : ${err.value}`
        customError.StatusCode = 404
      }


    console.log(err);
   return  res.status(customError.StatusCode).json({ msg: customError.msg})


    }
module.exports = errorHandler;