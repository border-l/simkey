const ThrowError = require('../errors/ThrowError')

function importSimkeyFunc(context, path, name) {
    const interpreter = new context.Interpreter(path)
    const exports = interpreter.getExport(name)
    for (const key in exports.IMPORTS) {
        context.model.IMPORTS[key] = exports.IMPORTS[key]
    }
    for (const key in exports.FUNCS) {
        context.model.FUNCS[key] = exports.FUNCS[key]
        const params = exports.FUNCS[key][1]
        for (const param of params) {
            if (context.model.MODES.includes(param[1])) {
                ThrowError(4310, { MODE: param[1], FUNC: key })
            }
            if (param[1] === "VECTOR" && !context.model.VECTORS[param[1]]) {
                context.model.VECTORS[param[0]] = [0, 0]
            }
            else if (param[1] === "BOOL" && context.settings[param[1]] === undefined) {
                context.settings[param[1]] = false
            }
        }
    }
}

module.exports = importSimkeyFunc