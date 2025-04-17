const deepClone = require("./helpers/deepClone")

async function loop(INFO, BLOCK) {
    while (true) {
        let ended = await INFO.INTERPRET(INFO.CONTEXT, INFO, BLOCK)
        if (ended) {
            break
        }
        BLOCK = deepClone(BLOCK)
    }
}

module.exports = { FUNCTION: loop, TAKES: { PARAMS: "", BLOCK: true, DONT_PARSE_BLOCK: false }}