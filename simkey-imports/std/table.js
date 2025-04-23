// Creates a new table format ("type")
function table(INFO, BLOCK, name) {
    name = name.trim()

    if (name.indexOf(":") > -1 || name.indexOf(" ") > -1) {
        throw new Error("Invalid name for table. Cannot contain colons or spaces. AT: " + name)
    }

    const subtables = BLOCK.join(" ").split(",").map(x => x.trim()).filter(x => x !== "")
    for (const subtable of subtables) {
        if (subtable.indexOf(":") > -1 || subtable.indexOf(" ") > -1) {
            throw new Error("Invalid name for subtable. Cannot contain colons or spaces. AT: " + name)
        }
    }

    INFO.CONTEXT.tables[name] = subtables
}

module.exports = { FUNCTION: table, TAKES: { PARAMS: "[LOOSE]", BLOCK: true, DONT_PARSE_BLOCK: true }}