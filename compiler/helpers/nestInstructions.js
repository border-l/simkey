/* IMPORTANT: THIS IS EXPERIMENTAL (for basic screen reading and OCR) */
function nestInstruction(keyc, nest) {
    if (nest === "") {
        return keyc
    }

    let result = ""
    for (let i = 0; i < keyc.length; i++) {
        if (keyc[i] === "\n") result += "\n" + nest
        else if (i === 0) result += nest + keyc[i]
        else result += keyc[i]
    }

    return result
}

module.exports = nestInstruction