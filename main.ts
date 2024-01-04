let item = 0
Brickcell.oled_ssd1306.initOLED(60)
Brickcell.oled_ssd1306.drawRect(
    0,
    0,
    60,
    30,
    1
)
Brickcell.oled_ssd1306.showString(
    0,
    0,
    "Brickcell",
    1
)
Brickcell.oled_ssd1306.showString(
    0,
    1,
    "Hello",
    0
)
basic.forever(function () {
    Brickcell.oled_ssd1306.showNumber(
        0,
        3,
        item,
        1
    )
    item += 1
    basic.pause(1000)
})
