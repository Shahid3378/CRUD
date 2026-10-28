module.exports.success = (res, data, message) => {
    return res.status(200).send({
        success:true,
        data,
        message
    })
}

module.exports.error = (res, message) => {
    return res.status(400).send({
        success:false,
        message
    })
}