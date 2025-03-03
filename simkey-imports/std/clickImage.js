function clickImage(INFO, BLOCK, x1, y1, x2, y2, path) {
    return `i${x1},${y1}-${x2},${y2}-"${path}"\nIci\nIpMB_LEFT\nIrMB_LEFT`
}

module.exports = { FUNCTION: clickImage, TAKES: { PARAMS: "[NUM, NUM, NUM, NUM, STR]", BLOCK: true } }