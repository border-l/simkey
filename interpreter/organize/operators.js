const ThrowError = require("../errors/ThrowError")

// Functions used for each assignment operator
const asnOperators = {
    "=": (input, variable, varName) => input,
    "+=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "+= used in vector assignment with" + varName })
        return variable + input
    }, 
    "-=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "-= used in vector assignment with" + varName })
        return variable - input
    },
    "*=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "*= used in vector assignment with" + varName })
        return variable * input
    },
    "/=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "/= used in vector assignment with" + varName })
        if (input === 0) ThrowError(2710, { AT: varName })
        return variable / input
    },
    "//=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "//= used in vector assignment with" + varName })
        if (input === 0) ThrowError(2710, { AT: varName })
        return Math.floor(variable / input)
    }
}

module.exports = asnOperators