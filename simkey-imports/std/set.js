const checkVariableName = require("../../interpreter/helpers/checkVariableName")
const evaluateExpr = require("../../interpreter/helpers/evaluateExpr")

// Set index 0 of vector to evaluated expression
function set(INFO, vectorAndExpression) {
    // Split to get name and expression
    const [vectorName, ...rest] = vectorAndExpression.split(",")
    const expression = rest.join(",")

    // Must be a valid variable name
    if (!checkVariableName(vectorName)) {
        throw new Error("Invalid variable name given to @set function: " + vectorName)
    }

    // Check it is not already a boolean
    if (INFO.CONTEXT.settings[vectorName]) {
        throw new Error("Attempted to set a vector under a name that is already a boolean: " + vectorName)
    }

    // Set it to [0,0] by default if doesnt exist
    if (!INFO.CONTEXT.model.VECTORS[vectorName]) {
        INFO.CONTEXT.model.VECTORS[vectorName] = [0,0]
    }

    const context = {
        model: {
            VECTORS: INFO.CONTEXT.model.VECTORS,
            settings: INFO.CONTEXT.settings
        }
    }

    // Set 0th index to be the evaluated expression
    INFO.CONTEXT.model.VECTORS[vectorName][0] = evaluateExpr(context, expression)
}

module.exports = { FUNCTION: set, TAKES: { PARAMS: "[LOOSE]" } }