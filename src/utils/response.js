const success = {
  SUCCESS: true,
  FAILURE: false,
};

const ResponseStatus = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  PAYMENT_REQUIRED: 402,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  ACCESS_DENIED: 440,
  INTERNAL_ERROR: 500,
};

const successResponse = (res, msg, data) => {
  if (data) {
    res.status(ResponseStatus.SUCCESS).send({
      msg,
      data,
    });
    return;
  }
  res.status(ResponseStatus.SUCCESS).send({
    msg,
  });
};

const createdSuccessResponse = (res, msg, data) => {
  res.status(ResponseStatus.CREATED).send({
    msg,
    data,
  });
};

const notFoundResponse = (res, msg = 'Not found') => {
  res.status(ResponseStatus.NOT_FOUND).send({
    msg,
  });
};

const notFoundResponseWithDevMsg = ({ res, msg, error }) => {
  if (!msg)
    msg = 'Resource not found. Please try again later or contact support';
  if (!error) error = msg;
  res.status(ResponseStatus.NOT_FOUND).send({
    msg: msg,
    error: error,
  });
};

const unauthorizedResponse = (res, msg = 'Unauthorized') => {
  res.status(ResponseStatus.UNAUTHORIZED).send({
    msg,
  });
};

const unauthorizedResponseWithDevMsg = ({ res, msg, error }) => {
  if (!msg)
    msg = 'Unauthorized. Please check your credentials or contact support';
  if (!error) error = msg;
  res.status(ResponseStatus.UNAUTHORIZED).send({
    msg: msg,
    error: error,
  });
};

const badRequestResponse = (res, msg = 'Bad request') => {
  res.status(ResponseStatus.BAD_REQUEST).send({
    msg,
  });
};

const badRequestResponseWithDevMsg = ({ res, msg, error }) => {
  if (!msg) msg = 'Invalid request. Please try again later or contact support';
  if (!error) error = msg;
  res.status(ResponseStatus.BAD_REQUEST).send({
    msg: msg,
    error: error,
  });
};

const forbiddenResponse = (res, msg = 'Forbidden') => {
  res.status(ResponseStatus.FORBIDDEN).send({
    msg,
  });
};

const forbiddenResponseWithDevMsg = ({ res, msg, error }) => {
  if (!msg) msg = 'Access denied. Please contact support for assistance';
  if (!error) error = msg;
  res.status(ResponseStatus.FORBIDDEN).send({
    msg: msg,
    error: error,
  });
};

const serverErrorResponse = (res, msg = 'Internal server error') => {
  res.status(ResponseStatus.INTERNAL_ERROR).send({
    msg,
  });
};

const serverErrorResponseWithDevMsg = ({ res, msg, error }) => {
  if (!msg)
    msg = 'An error occurred, please try again later or contact support';
  if (!error) error = msg;
  res.status(ResponseStatus.INTERNAL_ERROR).send({
    msg: msg,
    error: error,
  });
};

const accessDeniedResponse = (res, msg = 'Access denied', data) => {
  res.status(ResponseStatus.ACCESS_DENIED).send({
    msg,
    data,
  });
};

const accessDeniedResponseWithDevMsg = ({ res, msg, error }) => {
  if (!msg) msg = 'Access denied. Please contact support for assistance';
  if (!error) error = msg;
  res.status(ResponseStatus.ACCESS_DENIED).send({
    msg: msg,
    error: error,
  });
};

const unprocessableEntityResponse = (res, msg = 'Unprocessable entity') => {
  res.status(ResponseStatus.UNPROCESSABLE_ENTITY).send({
    msg,
  });
};

const unprocessableEntityResponseWithDevMsg = ({ res, msg, error }) => {
  if (!msg)
    msg =
      "We're unable to fulfill your request at this time. Please try again later or contact support";
  if (!error) error = msg;
  res.status(ResponseStatus.UNPROCESSABLE_ENTITY).send({
    msg: msg,
    error: error,
  });
};

const paymentRequiredResponse = (res, msg = 'Payment required') => {
  res.status(ResponseStatus.PAYMENT_REQUIRED).send({
    msg,
  });
};

const paymentRequiredResponseWithDevMsg = ({
  res,
  msg = 'Payment required',
  error,
}) => {
  if (!msg)
    msg =
      'Payment required. Please complete the payment process or contact support';
  if (!error) error = msg;
  res.status(ResponseStatus.PAYMENT_REQUIRED).send({
    msg: msg,
    error: error,
  });
};

module.exports = {
  ResponseStatus,
  successResponse,
  createdSuccessResponse,
  notFoundResponse,
  notFoundResponseWithDevMsg,
  unauthorizedResponse,
  unauthorizedResponseWithDevMsg,
  badRequestResponse,
  badRequestResponseWithDevMsg,
  forbiddenResponse,
  forbiddenResponseWithDevMsg,
  serverErrorResponse,
  serverErrorResponseWithDevMsg,
  accessDeniedResponse,
  accessDeniedResponseWithDevMsg,
  unprocessableEntityResponse,
  unprocessableEntityResponseWithDevMsg,
  paymentRequiredResponse,
  paymentRequiredResponseWithDevMsg,
};
