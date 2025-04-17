const checkVariableName = require("../../interpreter/helpers/checkVariableName")
const evaluateExpr = require("../../interpreter/helpers/evaluateExpr")

// Set a boolean to evaluated expression
function setBool(INFO, boolAndExpression) {
    // Split to get name and expression
    const [boolName, ...rest] = boolAndExpression.split(",")
    const expression = rest.join(",")

    // Must be a valid variable name
    if (!checkVariableName(boolName)) {
        throw new Error("Invalid variable name given to @setBool function: " + boolName)
    }

    // Cannot change modes
    if (INFO.CONTEXT.model.MODES.includes(boolName)) {
        throw new Error("Attempting to set a mode with @setBool: " + boolName)
    }

    // Check it is not already a vector
    if (INFO.CONTEXT.model.VECTORS[boolName]) {
        throw new Error("Attempted to set a bool under a name that is already a vector: " + vectorName)
    }

    // Literal boolean, evaluate instantly
    if (expression.trim() === "TRUE" || expression.trim() === "FALSE") {
        INFO.CONTEXT.settings[boolName] = expression.trim() === "TRUE" ? true : false
        return
    }

    const context = {
        model: {
            VECTORS: INFO.CONTEXT.model.VECTORS,
            settings: INFO.CONTEXT.settings
        }
    }

    // Set bool to the evaluated expression
    INFO.CONTEXT.settings[boolName] = evaluateExpr(context, expression, true)
}

module.exports = { FUNCTION: setBool, TAKES: { PARAMS: "[LOOSE]" } }