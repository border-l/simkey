const ThrowError = require('../errors/ThrowError')
const combineTillNext = require("../helpers/combineTillNext")
const parseFuncParams = require("./parseFuncParams")

// Parses the body of a simkey func
function parseFuncBody(context, name, index, parseInnards, depth) {
    const [paramString, nextBracket] = combineTillNext(context, "{", index)
    const params = paramString === "none" ? [] : paramString.split(",")

    if (nextBracket === -1) {
        ThrowError(1035, { AT: name })
    }

    const [block, newIndex] = parseInnards(context, nextBracket, depth)

    parseFuncParams(context, params)
    context.model.FUNCS[name] = [block, params]

    return newIndex
}

module.exports = parseFuncBody