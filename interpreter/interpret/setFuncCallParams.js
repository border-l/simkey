const getVariable = require("../types/getVariable")
const getVectorNumber = require("../types/getVectorNumber")
const evaluateExpr = require("../helpers/evaluateExpr")
const checkVariableName = require("../helpers/checkVariableName")
const checkValidExpr = require("../helpers/checkValidExpr")
const ThrowError = require("../errors/ThrowError")

// Sets all the parameter variables for simkey function
function setFuncCallParams(context, func, args) {
    // Get parameters for function
    const funcParams = context.model.FUNCS[func]

    // Too little or too many arguments, throw error
    if (args.length > funcParams[1].length) {
        ThrowError(2105, { AT: func })
    }
    if (args.length < funcParams[1].length) {
        ThrowError(2100, { AT: func })
    }

    // List for setting to be done by compile function (will be in instruction list)
    const setList = []

    // Set parameters for each argument
    for (let i = 0; i < args.length; i++) {
        const arg = args[i].trim()

        // Variable to set
        const varName = funcParams[1][i]

        // Literal boolean
        if (arg === "TRUE" || arg === "FALSE") {
            setList.push(["SET", varName, "ALL", () => (arg === "TRUE" ? true : false)])
            continue
        }

        // Literal number
        if (!isNaN(Number(arg)) && arg.trim() != "") {
            setList.push(["SET", varName, 0, () => Number(arg)])
            continue
        }

        // Simple variable to handle
        if (checkVariableName(arg, true)) {
            if (arg.indexOf(":") > -1) setList.push(["SET", varName, 0, (context) => getVariable(context, arg, ["NUM"])])
            else setList.push(["SET", varName, "ALL", (context) => getVariable(context, arg, ["VECTOR", "BOOL"])])
            continue
        }

        // Assign to expression as-is
        setList.push(["SET", varName, "ALL", (context) => evaluateExpr(context, arg, true, true)])
    }

    return setList
}

module.exports = setFuncCallParams