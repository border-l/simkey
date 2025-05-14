// const specials = ["for", "loop", "repeat", "if", "elseif", "else"]

// Splits the script into tokens
function tokenize(context) {
    const regex = /([ \t\n\r])/g
    const split = context.script.split(regex).filter(token => token.length > 0 && token !== ' ' && token !== "\n" && token !== '\t' && token !== '\r')
    let inString = false

    for (let i = 0; i < split.length; i++) {
        let token = split[i]
        if (inString && token === "end") split[i] = "\\" + token
        // if (!inString) for (const special of specials) {
        //     if (token === special) {
        //         split[i] = "@" + token
        //         break
        //     }
        // }
    }

    context.update('tokens', split)
}

module.exports = tokenize