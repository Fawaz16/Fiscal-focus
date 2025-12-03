const errorHandler = (err, req, res) => {
  //default error object
  let error = {
    statusCode: err.statusCode || 500,
    status: err.status || "error",
    message: err.message || "something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  };

  // Here i can put in custom error handing

  //log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error: ", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user ? req.user.id : "Unauthenticated",
      timestamp: new Date().toISOString()
    });
  } else if (process.env.NODE_ENV === "production") {
    console.error("Production Error: ", {
      message: err.message,
      path: req.path,
      method: req.method,
      user: req.user ? req.user.id : "Unauthenticated",
      timestamp: new Date().toISOString()
    });
  }

  //send error responses
  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
      error: err
    }),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

module.exports = { errorHandler };
