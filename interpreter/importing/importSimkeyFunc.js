const ThrowError = require('../errors/ThrowError')

// Imports simkey funcs, as well as JS ones if included in label (name)
function importSimkeyFunc(context, path, name) {
    const interpreter = new context.Interpreter(path)
    const exports = interpreter.getExport(name)

    // Copy over into IMPORTS
    for (const key in exports.IMPORTS) {
        context.model.IMPORTS[key] = exports.IMPORTS[key]
    }

    // Copy into FUNCS (need to initialize params first)
    for (const key in exports.FUNCS) {
        context.model.FUNCS[key] = exports.FUNCS[key]
        const params = exports.FUNCS[key][1]

        // Either already constant or will set to vector
        for (const param of params) {
            if (context.constants.includes(param)) ThrowError(4310, { MODE: param, FUNC: key })
            if (!Array.isArray(param)) context.variables[param] = [0, 0]
        }
    }
}

module.exports = importSimkeyFunc