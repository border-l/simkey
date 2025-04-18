const getInstructionList = require("./getInstructionList")
const runExpressionObject = require("./runExpressionObject")
const handleSET = require("./handleSET")
const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require("../helpers/evaluateExpr")
const getVectorNumber = require("../types/getVectorNumber")

async function interpreter(passedInfo, instructionList) {
    for (let i = 0; i < instructionList.length; i++) {
        const instruction = instructionList[i]

        // Key expression object
        if (instruction instanceof Object && !Array.isArray(instruction)) {
            await runExpressionObject(instruction, passedInfo.HELD, passedInfo.DEF, passedInfo.ROBOT)
            continue
        }

        const func = instruction[0]

        // End
        if (instruction === "@end") {
            return true
        }

        // Otherwise, handle imported function call
        let result

        // Handle conditional
        if (Array.isArray(func)) {
            for (let x = 0; x < func.length; x++) {
                // Branch should not be run
                if (func[x] !== "@else" && !evaluateExpr(passedInfo.CONTEXT, instruction[1][x], true)) {
                    continue
                }

                const check = await interpreter(passedInfo, getInstructionList(passedInfo.CONTEXT, instruction[2][x], "MACRO"))
                if (check) return true
                break
            }
        }

        // Special case, SET function
        else if (func === "SET") {
            handleSET(passedInfo.CONTEXT, instruction)
        }

        // Assignment statement
        else if (func === "ASSN") {
            if (instruction[3] === "NEXT INSTRUCTION") continue
            assign(passedInfo.CONTEXT, instruction)
        }

        // Doesnt contain parameters where it should
        else if (!Array.isArray(instruction[1].args)) {
            ThrowError(5205, { AT: func })
        }

        // Imported function
        else {
            // Add to this as to not mutate original
            const newInstructions = []

            // Call each of the getVectorNumber binded functions
            for (let ind = 0; ind < instruction[1].args.length; ind++) {
                // Value func, append value from function to newInstructions
                if (typeof instruction[1].args[ind] === "function") {
                    newInstructions[ind] = instruction[1].args[ind]()
                }
                // Push since it is not a function
                else {
                    newInstructions.push(instruction[1].args[ind])
                }

                // Cannot be undefined
                if (newInstructions[ind] === undefined) {
                    ThrowError(2115, { AT: func })
                }
            }

            // Get result with arguments
            if (instruction[1].block.length > 0) {
                // Get the instructions or not depending on DONT_PARSE_BLOCK
                const passedBlock = passedInfo.CONTEXT.model.IMPORTS[func].DONT_PARSE_BLOCK ? instruction[1].block : getInstructionList(passedInfo.CONTEXT, instruction[1].block, "MACRO")
                if (newInstructions.length > 0) result = await passedInfo.CONTEXT.model.IMPORTS[func.substring(1)](passedInfo, passedBlock, ...newInstructions)
                else result = await passedInfo.CONTEXT.model.IMPORTS[func.substring(1)](passedInfo, passedBlock)
            }
            else {
                result = await passedInfo.CONTEXT.model.IMPORTS[func.substring(1)](passedInfo, ...newInstructions)
            }
        }

        // No result, continue
        if (!result) {
            continue
        }

        if (result === "END") {
            return true
        }

        // Previous was assignment to next instruction, so assign result
        if (i > 0 && instructionList[i - 1][3] === "NEXT INSTRUCTION") {
            // THIS ISNT DEALT WITH PROPERLY
            assign(passedInfo.CONTEXT, instructionList[i - 1], result)
        }
    }
    return false
}

function assign(context, instruction, input) {
    // Retrieve variable (undefined if doesnt exist, otherwise boolean or number)
        // If the variable is a mode, error instantly
    // Check if arg is array
    // Otherwise single:
        // Evaluate it
        // Not valid, then check if it's a variable directly
        // Error if none of those match
    // Result is processed, pass in to assignment function with variable
        // UPDATE THOSE FUNCTIONS TO WORK PROPERLY FIRST!
    // Check type of result to see how to handle assigning
        // Already switch & returned vector, error, otherwise implicit conversion if type mismatch

    let [_, varName, assnFunction, exprValue] = instruction

    // Get whatever variable is
    let variable = context.settings[varName]
    variable = variable === undefined ? context.model.VECTORS[varName] : variable

    // In case of index, handle that
    let index = 0
    if (varName.indexOf(":") > 0) {
        variable = getVectorNumber(context, varName)
        index = evaluateExpr(context, varName.slice(varName.indexOf(":") + 1))
        varName = varName.slice(0, varName.indexOf(":"))
    }

    // Make sure not a constant mode
    if (context.model.MODES.includes(varName)) {
        ThrowError(2700, { AT: varName })
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
        result = evaluateExpr(context, exprValue)
    }

    // Cannot be implicitly converted
    if (typeof variable === "boolean" && Array.isArray(result)) {
        ThrowError(2705, { AT: varName })
    }

    // Assignment & implicit if needed
    if (typeof variable === "boolean") {
        result = !!result
        context.settings[varName] = assnFunction(result, variable, varName)
        return
    }

    // Reassign whole vector
    if (Array.isArray(result)) {
        context.model.VECTORS[varName] = assnFunction(result, variable, varName)
        return
    }

    // Implicit if needed
    result = Number(result)

    // Assign at index if exists, otherwise create new with second being 0
    // Assigning to non-zero index without already existing vector throws error earlier
    if (variable !== undefined) {
        context.model.VECTORS[varName][index] = assnFunction(result, variable, varName)
    }
    else {
        context.model.VECTORS[varName] = [assnFunction(result, variable, varName), 0]
    }
}

module.exports = interpreter