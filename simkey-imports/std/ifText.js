function ifText(INFO, BLOCK, x1, y1, x2, y2, matchText) {
    INFO.LIST.splice(INFO.INDEX + 1, 0, "START_T", ...BLOCK, "END_T")
    return `t${x1},${y1}-${x2},${y2}-"${matchText}"`
}

module.exports = { FUNCTION: ifText, TAKES: { PARAMS: "[NUM, NUM, NUM, NUM, STR]", BLOCK: true } }