// Calls interpret on instructions without waiting, making it async
function asyncFunc(INFO, BLOCK) {
    for (const instruction of BLOCK) {
        INFO.RUN(INFO, [instruction])
    }
}

module.exports = { FUNCTION: asyncFunc, TAKES: { PARAMS: "", BLOCK: true } }