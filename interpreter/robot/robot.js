const path = require("path")
const mapping = require("./mapping")
const ThrowError = require("../errors/ThrowError")

const ffi = require("ffi-napi")
const ref = require("ref-napi")
const ArrayType = require("ref-array-napi")

const libPath = path.resolve(__dirname, 'robot')
const robot = ffi.Library(libPath, {
    'keyDown': ['void', ['uchar']],
    'keyUp': ['void', ['uchar']],
    'mouseDown': ['void', ['int']],
    'mouseUp': ['void', ['int']],
    'setCursor': ['void', ['int', 'int']],
    'scroll': ['void', ['int']],
    'getCursor': ['void', [ArrayType(ref.types.int, 2)]],
    'getScreenSize': ['void', [ArrayType(ref.types.int, 2)]],
    'getPixelColor': ['void', ['int', 'int', ArrayType(ref.types.int, 3)]]
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function send(input) {
    if (!Array.isArray(input)) ThrowError(2600, { AT: "non-array given to robot.send function" })
    const [key, down] = input
    const map = mapping[key]
    if (map === undefined) ThrowError(2600, { AT: key })

    if (map.shift === null) {
        down ? robot.mouseDown(map.code) : robot.mouseUp(map.code)
        return
    }

    const send = down ? robot.keyDown : robot.keyUp
    if (map.shift) send(mapping.SHIFT.code)
    send(map.code)
}

function getCursor() {
    const coords = new (ArrayType(ref.types.int, 2))()
    robot.getCursor(coords)
    return Array.from(coords)
}

function getPixel(x, y) {
    const color = new (ArrayType(ref.types.int, 3))()
    robot.getPixelColor(x, y, color)
    return Array.from(color)
}

function getScreenSize() {
    const size = new (ArrayType(ref.types.int, 2))()
    robot.getScreenSize(size)
    return Array.from(size)
}

module.exports = {send, cursor: robot.setCursor, scroll: robot.scroll, sleep, getCursor, getPixel, getScreenSize}