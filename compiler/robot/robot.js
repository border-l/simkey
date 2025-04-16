const mapping = require("./mapping")
const ffi = require("ffi-napi")
const ThrowError = require("../errors/ThrowError")
const path = require("path")

const libPath = path.resolve(__dirname, 'robot')
const robot = ffi.Library(libPath, {
    'keyDown': ['void', ['uchar']],
    'keyUp': ['void', ['uchar']],
    'mouseDown': ['void', ['int']],
    'mouseUp': ['void', ['int']],
    'setCursor': ['void', ['int', 'int']],
    'scroll': ['void', ['int']]
})

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function sendInput(input) {
    const [key, down] = input
    const map = mapping[key]
    if (!map) ThrowError(2600, { AT: key })

    if (map.shift === null) {
        down ? mouseDown() : mouseUp()
        return
    }

    const send = down ? robot.keyDown : robot.keyUp
    if (map.shift) send(mapping.SHIFT.code)
    send(map.code)
}

module.exports = [sendInput, robot.setCursor, robot.scroll, wait]