const ThrowError = require("../errors/ThrowError")
const getVectorNumber = require("../types/getVectorNumber")

// Gets number value from vector
function getVariable(context, variable, expected) {
    let solution = undefined

    // Each possible expected type for getting value
    for (const expecter of expected) {
        // Get type regardless of optionality
        const expect = expecter.includes(":OPTIONAL") ? expecter.slice(0,-9) : expecter
    
        // Check for type num (getVectorNumber)
        if (expect === "NUM") {
            const vectorNum = getVectorNumber(context, variable, true)
            if (vectorNum === false) continue
            solution = vectorNum
            break
        }

        // Check for type bool (settings)
        else if (expect === "BOOL") {
            if (typeof context.variables[variable] !== "boolean") continue
            solution = context.variables[variable]
            break
        }

        // Check for vector (VECTORS)
        else {
            if (!Array.isArray(context.variables[variable])) continue
            solution = context.constants.includes(variable) ? context.variables[variable].map(x => x) : context.variables[variable]
            break
        }
    }

    // No value found compliant with expected types
    if (solution === undefined) {
        ThrowError(2110, { AT: variable, ARG: variable, EXPECTED: expected })
    }

    // Solution exists
    return solution
}

module.exports = getVariable