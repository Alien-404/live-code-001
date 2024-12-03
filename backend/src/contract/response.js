const CreateSuccessResponse = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
        status: true,
        message: 'success',
        data: data,
    });
}

const CreateResponseError = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
        status: false,
        message: message || 'server error',
        data: null,
    });
}

module.exports = {
    CreateSuccessResponse,
    CreateResponseError
}