const getInstructionList = require("./getInstructionList")
const runExpressionObject = require("./runExpressionObject")
const solveConditional = require("./solveConditional")
const handleSET = require("./handleSET")
const ThrowError = require("../errors/ThrowError")

async function interpreter(context, passedInfo, instructionList) {
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

        // No arguments
        if (func.length === 1 && typeof func === "string") {
            result = context.model.IMPORTS[instruction.substring(1)](passedInfo)
        }

        // Handle conditional
        else if (Array.isArray(func)) {
            for (let x = 0; x < func.length; x++) {
                // Branch should not be run
                if (func[x] !== "@else" && !solveConditional(context, passedInfo, instruction[1][x])) {
                    continue
                }

                const check = await interpreter(context, passedInfo, getInstructionList(context, instruction[2][x], "MACRO"))
                if (check) return true
                break
                // // Add block of branch
                // instructionList.splice(i + 1, 0, ...getInstructionList(context, instruction[2][x], "MACRO"))
                // break
            }
        }

        // Special case, SET function
        else if (func === "SET") {
            handleSET(context, instruction)
        }

        // Doesnt contain parameters where it should
        else if (!Array.isArray(instruction[1].args)) {
            console.log(instruction)
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
                const passedBlock = context.model.IMPORTS[func].DONT_PARSE_BLOCK ? instruction[1].block : getInstructionList(context, instruction[1].block, "MACRO")
                if (newInstructions.length > 0) result = await context.model.IMPORTS[func.substring(1)](passedInfo, passedBlock, ...newInstructions)
                else result = await context.model.IMPORTS[func.substring(1)](passedInfo, passedBlock)
            }
            else {
                result = await context.model.IMPORTS[func.substring(1)](passedInfo, ...newInstructions)
            }
        }

        // No result, continue
        if (!result) {
            continue
        }

        if (result === "END") {
            return true
        }

        // Will handle result later (useful in a couple situations)
    }
    return false
}

module.exports = interpreter