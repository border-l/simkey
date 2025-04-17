const evaluateExpr = require("../../interpreter/helpers/evaluateExpr")

// Evaluates boolean statements about vectors (for conditional expressions)
function e(INFO, expression) {
    const context = {
        model: {
            VECTORS: INFO.CONTEXT.model.VECTORS,
            settings: INFO.CONTEXT.settings
        }
    }
    return evaluateExpr(context, expression, true)
}

module.exports = { FUNCTION: e, TAKES: { PARAMS: "[CONDITION-EXPRESSION]" } }