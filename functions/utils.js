function returnError(message, statusCode = 400) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  };
}

function returnSuccess(data) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}

module.exports = {
  returnError,
  returnSuccess,
};
