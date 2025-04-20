const ThrowError = require("../errors/ThrowError")

// Set instruction to be handled directly by compile function
function handleSET(context, instruction) {
    // Separate parts of instruction
    const [_, varName, index, valueFunc] = instruction
    const value = valueFunc(context)

    // Handle boolean set
    // if (index === "BOOL") {
    //     // if (context.variables[varName] === undefined) {
    //     //     ThrowError(5100, { VAR: varName, TYPE: "BOOL" })
    //     // }

    //     context.variables[varName] = !!value
    //     return
    // }

    // Must be vector to get here
    // if (!Array.isArray(context.variables[varName])) {
    //     ThrowError(5100, { VAR: varName, TYPE: "VECTOR" })
    // }

    // Setting entire vector array to be something else
    if (index === "ALL") {
        // if (!Array.isArray(value)) {
        //     ThrowError(5105, { VECTOR: varName, VALUE_TYPE: typeof value })
        // }

        if (typeof value === "number" && Array.isArray(context.variables[varName])) {
            context.variables[varName][0] = value
            return
        }

        context.variables[varName] = value
        return
    }

    // Set a specific index instead

    // Non existent array
    if (!Array.isArray(context.variables[varName])) {
        ThrowError(5100, { AT: varName, TYPE: "VECTOR" })
    }
    // Non number index
    if (isNaN(index) || index === null) {
        ThrowError(5110, { VECTOR: varName, INDEX: index })
    }
    // Non number value
    if (isNaN(value) || value === null) {
        ThrowError(5115, { VECTOR: varName, VALUE: value })
    }

    // Set it, they're both valid
    context.variables[varName][index] = value
}

module.exports = handleSET