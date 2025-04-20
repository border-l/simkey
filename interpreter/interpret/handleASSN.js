const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require('../helpers/evaluateExpr')
const getVectorNumber = require("../types/getVectorNumber")

// Handle ASSN instructions (assignments)
function handleASSN(context, instruction, input) {
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

    // Make sure not a constant mode
    // if (context.model.MODES.includes(varName)) {
    //     ThrowError(2700, { AT: varName })
    // }

    let result = input

    // Array and single values handling
    if (Array.isArray(exprValue)) {
        result = []
        for (const expr of exprValue) {
            result.push(evaluateExpr(context, expr))
        }
    }
    else if (result === undefined) {
        result = evaluateExpr(context, exprValue)
    }

    // // Cannot be implicitly converted
    // if (typeof variable === "boolean" && Array.isArray(result)) {
    //     ThrowError(2705, { AT: varName })
    // }

    // // Assignment & implicit if needed
    // if (typeof variable === "boolean") {
    //     result = !!result
    //     context.variables[varName] = assnFunction(result, variable, varName)
    //     return
    // }

    // // Reassign whole vector
    // if (Array.isArray(result)) {
    //     context.variables[varName] = assnFunction(result, variable, varName)
    //     return
    // }

    // // Implicit if needed
    // result = Number(result)

    // Assign at index if exists, otherwise create new with second being 0
    // Assigning to non-zero index without already existing vector throws error earlier
    // if (index !== undefined) {
    //     context.variables[varName][index] = assnFunction(result, variable, varName)
    // }
    // else {
    //     context.variables[varName] = [assnFunction(result, variable, varName), 0]
    // }

    if (typeof result === "number") {
        if (Array.isArray(variable) || index !== null) context.variables[varName][index === null ? 0 : index] = assnFunction(result, variable, varName)
        else context.variables[varName] = [assnFunction(result, variable, varName), 0]
        return
    }

    context.variables[varName] = assnFunction(result, variable, varName)
}

module.exports = handleASSN