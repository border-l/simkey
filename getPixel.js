function getPixel(INFO, x, y) {
    return INFO.ROBOT.getPixel(x, y)
}

module.exports = { FUNCTION: getPixel, TAKES: { PARAMS: "[NUM, NUM]" }}