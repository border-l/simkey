const path = require("path")
const mapping = require("./mapping")
const ThrowError = require("../errors/ThrowError")

const ffi = require("ffi-napi")
const ref = require("ref-napi")
const intArrayType = ref.refType(ref.types.int)

const libPath = path.resolve(__dirname, 'robot')
const robot = ffi.Library(libPath, {
    'keyDown': ['void', ['uchar']],
    'keyUp': ['void', ['uchar']],
    'mouseDown': ['void', ['int']],
    'mouseUp': ['void', ['int']],
    'setCursor': ['void', ['int', 'int']],
    'scroll': ['void', ['int']],
    'getCursor': ['void', [intArrayType]],
    'getScreenSize': ['void', [intArrayType]],
    'getPixelColor': ['void', ['int', 'int', intArrayType]]
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
    const coords = Buffer.alloc(2 * ref.types.int.size)
    robot.getCursor(coords)
    return BufferToArray(coords)
}

function getPixel(x, y) {
    const color = Buffer.alloc(3 * ref.types.int.size)
    robot.getPixelColor(x, y, color)
    return BufferToArray(color)
}

function getScreenSize() {
    const size = Buffer.alloc(2 * ref.types.int.size)
    robot.getScreenSize(size)
    return BufferToArray(size)
}

function BufferToArray(buff) {
    const res = []
    for (let i = 0; i < buff.length; i+= 4) {
        res.push(buff.readInt32LE(i))
    }
    return res
}

module.exports = {send, cursor: robot.setCursor, scroll: robot.scroll, sleep, getCursor, getPixel, getScreenSize}