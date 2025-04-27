const getArray = require("../types/getArray")
const parseSection = require("./parseSection")
const getString = require("../types/getString")
const ThrowError = require("../errors/ThrowError")
const checkVariableName = require("../helpers/checkVariableName")

// Handles meta section
module.exports = (context) => {
    parseSection(context, (tokens, token, i, section, next) => {
        // First input for token
        const firstIn = tokens[i + 1]

        if (token === "REPEAT") {
            // Number repeat
            if (Number(firstIn)) {
                context.model.META.REPEAT = Number(firstIn)
            }
            // Literal repeat (boolean)
            else if (firstIn === "OFF" || firstIn === "ON") {
                context.model.META.REPEAT = firstIn
            }
            // Not a valid value
            else {
                ThrowError(2000, { AT: firstIn })
            }

            // Move along index
            return i + 1
        }

        else if (token === "NAME") {
            // Deal with string and move along, error if no starting "
            if (!firstIn.startsWith("\"")) {
                ThrowError(2005, { AT: firstIn })
            }

            // Get string for the name
            const [value, newIndex] = getString(context, i + 1)

            // Update meta in model
            context.model.META.NAME = value

            // Move along to end of the string
            return newIndex
        }

        else if (token === "MODE") {
            // Set value if valid variable name, otherwise error
            if (!checkVariableName(firstIn)) {
                ThrowError(2010, { AT: firstIn })
            }
            // Update meta in model
            context.model.META.MODE = firstIn

            // Move index along
            return i + 1
        }

        else if (token === "SWITCHES") {
            // Parse array if opening bracket is present in correct spot, otherwise error
            if (!firstIn.startsWith("[")) {
                ThrowError(1010, { AT: firstIn })
            }

            // Get array and check valid elements
            const [value, newIndex] = getArray(context, i + 1)

            // Check if each variable is validly named
            value.forEach((val) => 
                !checkVariableName(val) ? ThrowError(2015, { AT: val }) : 0)

            // Update meta in model
            context.model.META.SWITCHES = value

            // Index after array
            return newIndex
        }

        // Handle shortcut assignment
        else if (token === "SHORTCUT") {
            context.model.META.SHORTCUT = firstIn
            return i + 1
        }

        // Invalid attribute named in assignment
        else {
            ThrowError(2020, { AT: token })
        }
    }, (section) => section === "META")
}