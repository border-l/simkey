// Holds keys while performing expressions in block
async function withKeys(INFO, BLOCK, Keys) {
    // Expression to hold relevant keys
    const keyExpressions = { hold: 0, wait: 25, keysPressed: [], keysHeld: [...Keys.replace(/\s/g, '').split(",")] }
    return (await INFO.INTERPRET(INFO.CONTEXT, INFO, [keyExpressions, ...BLOCK, keyExpressions])) ? "END" : false
}

module.exports = { FUNCTION: withKeys, TAKES: { PARAMS: "[LOOSE]", BLOCK: true } }