function ifImage(INFO, BLOCK, x1, y1, x2, y2, path) {
    INFO.LIST.splice(INFO.INDEX + 1, 0, "START_I", ...BLOCK, "END_I")
    return `i${x1},${y1}-${x2},${y2}-"${path}"`
}

module.exports = { FUNCTION: ifImage, TAKES: { PARAMS: "[NUM, NUM, NUM, NUM, STR]", BLOCK: true } }