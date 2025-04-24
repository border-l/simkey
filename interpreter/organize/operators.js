const ThrowError = require("../errors/ThrowError")

// Functions used for each assignment operator
const asnOperators = {
    "=": (input, variable, varName) => input,
    "+=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "+= used in vector assignment with " + varName })
        return Array.isArray(variable) ? variable[0] + input : variable + input
    },
    "-=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "-= used in vector assignment with " + varName })
        if (isNaN(variable) || variable === "") ThrowError(2705, { AT: "-= used in vector assignment with " + varName })
        return Array.isArray(variable) ? variable[0] - input : variable - input
    },
    "*=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "*= used in vector assignment with " + varName })
        if ((isNaN(variable) || variable === "") && !Array.isArray(variable)) ThrowError(2705, { AT: "*= used in vector assignment with " + varName })
        return Array.isArray(variable) ? variable[0] * input : variable * input
    },
    "/=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "/= used in vector assignment with " + varName })
        if (isNaN(variable) || variable === "") ThrowError(2705, { AT: "/= used in vector assignment with " + varName })
        if (input === 0) ThrowError(2710, { AT: varName })
        return Array.isArray(variable) ? variable[0] / input : variable / input
    },
    "//=": (input, variable, varName) => {
        if (Array.isArray(input)) ThrowError(2705, { AT: "//= used in vector assignment with " + varName })
        if (isNaN(variable) || variable === "") ThrowError(2705, { AT: "//= used in vector assignment with " + varName })
        if (input === 0) ThrowError(2710, { AT: varName })
        return Array.isArray(variable) ? Math.floor(variable[0] / input) : Math.floor(variable / input)
    }
}

module.exports = asnOperators