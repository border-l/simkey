const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require('../helpers/evaluateExpr')
const getVectorNumber = require("../types/getVectorNumber")

// Handle ASSN instructions (assignments)
function handleASSN(context, instruction, input, constant = false) {
    let [_, varName, assnFunction, exprValue] = instruction

    // Get whatever variable is
    let variable = context.variables[varName]

    // In case of index, handle that
    let index = null
    if (varName.indexOf(":") > 0) {
        variable = getVectorNumber(context, varName)
        index = evaluateExpr(context, varName.slice(varName.indexOf(":") + 1))
        varName = varName.slice(0, varName.indexOf(":"))
    }

    // Make sure not a constant
    if (context.constants.includes(varName)) {
        ThrowError(2700, { AT: varName })
    }

    // Cannot make constant if already exists
    if (variable !== undefined && constant) {
        ThrowError(2725, { AT: varName })
    }

    let result = input

    // Array and single values handling
    if (Array.isArray(exprValue)) {
        result = []
        for (const expr of exprValue) {
            result.push(evaluateExpr(context, expr))
        }
    }
    else if (result === undefined) {
        result = evaluateExpr(context, exprValue, true, true)
    }

    if (typeof result === "number") {
        if (Array.isArray(variable) || index !== null) context.variables[varName][index === null ? 0 : index] = assnFunction(result, variable, varName)
        else context.variables[varName] = [assnFunction(result, variable, varName), 0]
    }
    else context.variables[varName] = assnFunction(result, variable, varName)

    if (constant) {
        context.constants.push(varName)
    }
}

module.exports = handleASSN