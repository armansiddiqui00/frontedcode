module.exports = (req, res, next) => {
    let mockdata;
    if (req.url.indexOf('getMenuByUser') > -1) {
        mockdata = require("./mocks/mock-getMenuByUser.js");
    } else {
        res.status(200).send({ message: "Successful" });
    }
    res.status(200).send(mockdata);
}