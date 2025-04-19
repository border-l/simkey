const setFuncCallParams = require("./setFuncCallParams")
const runExpressionObject = require("./runExpressionObject")
const handleSET = require("./handleSET")
const ThrowError = require("../errors/ThrowError")
const evaluateExpr = require("../helpers/evaluateExpr")
const handleASSN = require("./handleASSN")
const handleRET = require("./handleRET")

async function instructionRunner(passedInfo, instructionList) {
    for (let i = 0; i < instructionList.length; i++) {
        const instruction = instructionList[i]

        // Key expression object
        if (instruction instanceof Object && !Array.isArray(instruction)) {
            await runExpressionObject(passedInfo.CONTEXT, instruction, passedInfo.HELD, passedInfo.DEF, passedInfo.ROBOT)
            continue
        }

        const func = instruction[0]

        // End
        if (instruction === "@end") {
            return passedInfo.END_SYMBOL
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

                const check = await instructionRunner(passedInfo, instruction[2][x])
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
            if (instruction[3] === "ASSN NEXT INSTRUCTION") continue
            handleASSN(passedInfo.CONTEXT, instruction)
        }

        else if (func === "RET") {
            if (instruction[3] === "RET NEXT INSTRUCTION") continue
            return handleRET(passedInfo.CONTEXT, instruction)
        }

        else if (passedInfo.CONTEXT.model.FUNCS[func]) {
            result = await instructionRunner(passedInfo, [...setFuncCallParams(passedInfo.CONTEXT, instruction[0], instruction[1]), ...passedInfo.CONTEXT.model.FUNCS[func][0]])
        }

        else if (!passedInfo.CONTEXT.model.IMPORTS[func]) {
            ThrowError(5210, { AT: func })
        }

        // Doesnt contain parameters where it should
        else if (!Array.isArray(instruction[1].args)) {
            ThrowError(5205, { AT: func })
        }

        // Imported JS function
        else {
            // Add to this as to not mutate original
            const newInstructions = []

            // Call each of the getVectorNumber binded functions
            for (let ind = 0; ind < instruction[1].args.length; ind++) {
                // Value func, append value from function to newInstructions
                if (typeof instruction[1].args[ind] === "function") {
                    newInstructions[ind] = instruction[1].args[ind](passedInfo.CONTEXT)
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
                result = await passedInfo.CONTEXT.model.IMPORTS[func.substring(1)](passedInfo, instruction[1].block, ...(newInstructions.length > 0 ? newInstructions : []))
            }
            else {
                result = await passedInfo.CONTEXT.model.IMPORTS[func.substring(1)](passedInfo, ...newInstructions)
            }
        }

        if (i > 0 && instructionList[i - 1][3] === "ASSN NEXT INSTRUCTION") {
            if (result === undefined) ThrowError(2715, { AT: instruction[0] })
            handleASSN(passedInfo.CONTEXT, instructionList[i - 1], result)
        }

        else if (i > 0 && instructionList[i - 1][3] === "RET NEXT INSTRUCTION") {
            if (result === undefined) ThrowError(2800, { AT: instruction[0] })
            return handleRET(passedInfo.CONTEXT, instructionList[i - 1], result)
        }

        // No result, continue
        else if (result === undefined) {
            continue
        }

        else if (result === passedInfo.END_SYMBOL) {
            return passedInfo.END_SYMBOL
        }
    }
}

module.exports = instructionRunner