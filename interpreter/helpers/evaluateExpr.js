const parser = new (require("expr-eval").Parser)()
const getBalancedExpression = require('./getBalancedExpression')
const getVariable = require("../types/getVariable")
const ThrowError = require("../errors/ThrowError")

function evaluateExpr(context, expression, bool = false, asIs = false) {
    // Replace variables with value from getVariable
    const expr = expression.replaceAll(/\$\w+(?::[:\w]+)?/g, (varName) => {
        const variable = getVariable(context, varName)

        if ((variable instanceof Object || typeof variable === "string") && (!Array.isArray(variable) || isNaN(variable[0]))) {
            ThrowError(2910, { AT: varName + " (not a number, boolean, or number array)" })
        }

        return Array.isArray(variable) ? variable[0] : variable
    })

    // expr-eval evaluater
    const evaluate = parser.evaluate(expr, { "FALSE": false, "TRUE": true })

    // Return it as is
    if (asIs) return evaluate

    // Return according to bool arg
    return !bool ? Number(evaluate) : !(!evaluate)
}

module.exports = evaluateExpr