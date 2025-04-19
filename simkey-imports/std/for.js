const checkVariableName = require("../../interpreter/helpers/checkVariableName")
const deepClone = require("./helpers/deepClone")

// Loop through block from start to end with step, with variable holding index
async function forLoop(INFO, BLOCK, start, end, step, variable) {
    // No step of 0
    if (step === 0) {
        throw new Error("You cannot have a step of zero.")
    }

    // Get rid of extra spaces
    variable = variable.trim()

    // Check that variable name is valid
    if (!checkVariableName(variable)) {
        throw new Error("Variable name given to @for loop is not valid: " + variable)
    }
    if (INFO.CONTEXT.settings[variable]) {
        throw new Error("Index variable is already a boolean: " + variable)
    }

    //  Set to default [0,0] if doesnt exist
    if (!INFO.CONTEXT.model.VECTORS[variable]) {
        INFO.CONTEXT.model.VECTORS[variable] = [0,0]
    }

    // Function to compare for loop
    let compare = (i) => i <= end

    // Set compare to be i >= end (since step < 1)
    if (start > end) {
        if (step > 0) {
            throw new Error("You cannot have positive step when you start is bigger than your end: [START=" + start + "] [END=" + end + "]")
        }
        compare = (i) => i >= end
    }

    // Negative step and start <= end, error
    else if (step < 0) {
        throw new Error("You cannot have negative step when you start is less than your end: " + step)
    }

    // Loop through with compare, incrementing by step
    for (let i = start; compare(i); i += step) {
        INFO.CONTEXT.model.VECTORS[variable][0] = i
        await INFO.RUN(INFO, BLOCK)
        BLOCK = deepClone(BLOCK)
    }
}

module.exports = { FUNCTION: forLoop, TAKES: { PARAMS: "[NUM,NUM,NUM,LOOSE]", BLOCK: true } }