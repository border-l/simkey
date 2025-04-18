const getArray = require("../types/getArray")
const ThrowError = require("../errors/ThrowError")

// Get the parameter types for next imported function in array, returns new index and types
module.exports = (context, array) => {
    const [value, _] = getArray(context, 0, true, array)
    const parameters = []

    if (value.length === 1 && value[0] === "") {
        return ""
    }

    // Each part
    for (let x = 0; x < value.length; x++) {
        const part = value[x]
        const segment = part.split("|").map((val) => val.trim())

        // Each type in segment
        for (let i = 0; i < segment.length; i++) {
            const type = segment[i]

            // Does not match any type
            if (type !== "VECTOR" && type !== "NUM" && type !== "BOOL" && type !== "STR" && type !== "LOOSE"
                && type !== "VECTOR:OPTIONAL" && type !== "NUM:OPTIONAL" && type !== "BOOL:OPTIONAL" && type !== "STR:OPTIONAL" && type !== "LOOSE:OPTIONAL") {
                ThrowError(4000, { AT: type })
            }

            // Loose does not come last and alone
            if (type.indexOf("LOOSE") > -1 && (segment.length !== 1 || x !== value.length - 1)) {
                ThrowError(4200, { AT: part + " (does not come at the end AND by itself)" })
            }

            // Type put several times
            if (segment.indexOf(type) !== i) {
                ThrowError(4100, { AT: "[" + segment.join(" | ") + "]" })
            }
        }

        // Everything will match loose => something after is pointless
        if (segment.some((type) => type.startsWith("LOOSE")) && value[value.length - 1] !== part) {
            ThrowError(4200, { AT: array[0] + " " + part })
        }

        // If a type is optional, all types on the same level are too
        if (segment.some((type) => type.endsWith(":OPTIONAL"))) {
            segment.forEach((type, index) => {
                // No need to add it if there
                if (type.endsWith(":OPTIONAL")) {
                    return
                }

                // Add it otherwise
                segment[index] = type + ":OPTIONAL"
            })
        }

        // Done with segment
        parameters.push(segment)
    }

    // Parameters and move along
    return parameters
}