const parser = new (require("expr-eval").Parser)()
const getVariable = require("../types/getVariable")
const ThrowError = require("../errors/ThrowError")

function evaluateExpr(context, expression, bool = false, asIs = false) {
    const stored = new Map()

    // Deal with escaped brackets
        // These are done due to the parser's
        // bad design.
        // expr-eval deems this an "invalid escape
        // sequence", so when evaluating, get
        // rid of it before.
    expression = expression.replaceAll(/(?:"\\]\s|\s\\]\s)/g, "]")

    // Replace variables with random variable name from getVariable
    const expr = expression.replaceAll(/\$\w+(?::[:\w]+)?/g, (varName) => {
        const variable = getVariable(context, varName)

        if (!stored.get(variable)) {
            stored.set(variable, "a".repeat(stored.size + 1))
            return "a".repeat(stored.size)
        }
        else return stored.get(variable)
    })

    const variables = { "FALSE": false, "TRUE": true }
    stored.forEach((val, key) => variables[val] = key)

    // expr-eval evaluater
    const evaluate = parser.evaluate(expr, variables)

    if (isNaN(evaluate) && typeof evaluate !== "boolean") {
        ThrowError(1115, { AT: expression })
    }

    // Return it as is
    if (asIs) return evaluate

    // Return according to bool arg
    return !bool ? Number(evaluate) : !(!evaluate)
}

parser.functions.veccmp = (arg1, arg2) => {
    if (!Array.isArray(arg1) || !Array.isArray(arg2)) {

    }

    if (arg1.some(val => isNaN(val) || val === "") || arg2.some(val => isNaN(val) || val === "")) {

    }

    if (arg1.length !== arg2.length) return false

    for (let i = 0; i < Math.max(arg1.length, arg2.length); i++) {
        if (arg1[i] !== arg2[i]) return false
    }

    return true
}

parser.consts.TRUE = true
parser.consts.FALSE = false
delete parser.consts.true
delete parser.consts.false

module.exports = evaluateExpr