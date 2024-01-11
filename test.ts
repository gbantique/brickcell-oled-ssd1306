let ssd1306 = Brickcell.create(60)
let counter = 0
ssd1306.drawRect(
    0,
    0,
    63,
    31,
    1
)
ssd1306.showString(
    1,
    2,
    "Brickcell!",
    0
)
basic.forever(function () {
    ssd1306.showNumber(
        1,
        1,
        counter,
        1
    )
    counter += 1
    basic.pause(1000)
})
