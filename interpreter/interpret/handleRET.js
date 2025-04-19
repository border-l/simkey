const evaluateExpr = require('../helpers/evaluateExpr')

// Handle RET instructions (return statements)
function handleRET(context, instruction, input) {
    let [_, exprValue] = instruction
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

    return result
}

module.exports = handleRET