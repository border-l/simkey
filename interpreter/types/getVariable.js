const ThrowError = require("../errors/ThrowError")
const getVectorNumber = require("../types/getVectorNumber")
const getStringValue = require('../types/getStringValue')
const getTableValue = require('../types/getTableValue')

// Gets number value from vector
function getVariable(context, variable, expected) {
    let solution = undefined

    // Each possible expected type for getting value
    for (const expecter of expected) {
        // Get type regardless of optionality
        const expect = expecter.includes(":OPTIONAL") ? expecter.slice(0,-9) : expecter
    
        // Check for vector
        if (expect === "VECTOR") {
            if (!Array.isArray(context.variables[variable])) continue
            solution = context.constants.includes(variable) ? context.variables[variable].map(x => x) : context.variables[variable]
            break
        }

        // Check for type num
        if (expect === "NUM") {
            const vectorNum = getVectorNumber(context, variable, true)
            if (vectorNum === false) continue
            solution = vectorNum
            break
        }

        // Check for type bool
        else if (expect === "BOOL") {
            if (typeof context.variables[variable] !== "boolean") continue
            solution = context.variables[variable]
            break
        }

        // Table "object" type
        else if (expect === "TABLE") {
            const tableValue = getTableValue(context, variable, true, true)
            if (tableValue === undefined) continue
            solution = tableValue
            break
        }

        // String, since they can be variables now
        else if (expect === "STR") {
            const stringValue = getStringValue(context, variable, true)
            if (stringValue === false) continue
            solution = stringValue
            break
        }

        // Expected an invalid type (remember to change the deepcopying being done above)
        else ThrowError()
    }

    // No value found compliant with expected types
    if (solution === undefined) {
        ThrowError(2110, { AT: variable, ARG: variable, EXPECTED: expected })
    }

    // Solution exists
    return solution
}

module.exports = getVariable