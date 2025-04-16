// Types a string out (this overcomes the restriction of not being able to have repeats)
async function type(INFO, string, time = 10) {
    string = String(string)

    // Go through each char
    for (let i = 0; i < string.length; i++) {
        await INFO.ROBOT.sleep(time)
        await INFO.ROBOT.send([(string[i] === " ") ? "SPACE" : string[i], true])
        await INFO.ROBOT.send([(string[i] === " ") ? "SPACE" : string[i], false])
        await INFO.ROBOT.sleep(time)
    }

    await INFO.ROBOT.sleep(time)
}

module.exports = { FUNCTION: type, TAKES: { PARAMS: "[NUM | STR, NUM:OPTIONAL]", BLOCK: false } }