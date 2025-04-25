const parser = new (require("expr-eval").Parser)()
const getVariable = require("../types/getVariable")
const ThrowError = require("../errors/ThrowError")

function evaluateExpr(context, expression, bool = false, asIs = false) {
    const stored = new Map()

    // Replace variables with value from getVariable
    const expr = expression.replaceAll(/\$\w+(?::[:\w]+)?/g, (varName) => {
        const variable = getVariable(context, varName)

        // Not a number, boolean, or num array (at least first index)
        if ((variable instanceof Object || typeof variable === "string") && (!Array.isArray(variable) || isNaN(variable[0]))) {
            if (!stored.get(variable)) {
                stored.set(variable, "a".repeat(stored.size + 1))
                return "a".repeat(stored.size)
            }
            else return stored.get(variable)
        }

        return Array.isArray(variable) ? variable[0] : variable
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

module.exports = evaluateExpr