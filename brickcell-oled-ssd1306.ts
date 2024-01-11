/**
* makecode I2C OLED 128x64 Package.
* From microbit/micropython Chinese community.
* http://www.micropython.org.cn
*/

/**
 * Brickcell Development Kit
 */
//% color="#FFBF00" icon="\uf12e" weight=70
namespace Brickcell {
    /**
     * SSD1306 0.96 OLED Display
     */
    export class SSD1306 {
        private _I2CAddr: number;
        private _screen: Buffer;
        private _buf2: Buffer;
        private _buf3: Buffer;
        private _buf4: Buffer;
        private _ZOOM: number;
        private font: number[] = [];


        constructor() {
            this._I2CAddr = 0x3C;
            this._screen = pins.createBuffer(1057);
            this._buf2 = pins.createBuffer(2);
            this._buf3 = pins.createBuffer(3);
            this._buf4 = pins.createBuffer(4);
            this._ZOOM = 1;
            this.font = [
                0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
                0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
                0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
                0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
                0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
                0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422, 0x0022d422,
                0x0022d422, 0x0022d422, 0x00000000, 0x000002e0, 0x00018060,
                0x00afabea, 0x00aed6ea, 0x01991133, 0x010556aa, 0x00000060,
                0x000045c0, 0x00003a20, 0x00051140, 0x00023880, 0x00002200,
                0x00021080, 0x00000100, 0x00111110, 0x0007462e, 0x00087e40,
                0x000956b9, 0x0005d629, 0x008fa54c, 0x009ad6b7, 0x008ada88,
                0x00119531, 0x00aad6aa, 0x0022b6a2, 0x00000140, 0x00002a00,
                0x0008a880, 0x00052940, 0x00022a20, 0x0022d422, 0x00e4d62e,
                0x000f14be, 0x000556bf, 0x0008c62e, 0x0007463f, 0x0008d6bf,
                0x000094bf, 0x00cac62e, 0x000f909f, 0x000047f1, 0x0017c629,
                0x0008a89f, 0x0008421f, 0x01f1105f, 0x01f4105f, 0x0007462e,
                0x000114bf, 0x000b6526, 0x010514bf, 0x0004d6b2, 0x0010fc21,
                0x0007c20f, 0x00744107, 0x01f4111f, 0x000d909b, 0x00117041,
                0x0008ceb9, 0x0008c7e0, 0x01041041, 0x000fc620, 0x00010440,
                0x01084210, 0x00000820, 0x010f4a4c, 0x0004529f, 0x00094a4c,
                0x000fd288, 0x000956ae, 0x000097c4, 0x0007d6a2, 0x000c109f,
                0x000003a0, 0x0006c200, 0x0008289f, 0x000841e0, 0x01e1105e,
                0x000e085e, 0x00064a4c, 0x0002295e, 0x000f2944, 0x0001085c,
                0x00012a90, 0x010a51e0, 0x010f420e, 0x00644106, 0x01e8221e,
                0x00093192, 0x00222292, 0x00095b52, 0x0008fc80, 0x000003e0,
                0x000013f1, 0x00841080, 0x0022d422
            ];
        }

        private cmd1(d: number) {
            let n = d % 256;
            pins.i2cWriteNumber(this._I2CAddr, n, NumberFormat.UInt16BE);
        }

        private cmd2(d1: number, d2: number) {
            this._buf3[0] = 0;
            this._buf3[1] = d1;
            this._buf3[2] = d2;
            pins.i2cWriteBuffer(this._I2CAddr, this._buf3);
        }

        private cmd3(d1: number, d2: number, d3: number) {
            this._buf4[0] = 0;
            this._buf4[1] = d1;
            this._buf4[2] = d2;
            this._buf4[3] = d3;
            pins.i2cWriteBuffer(this._I2CAddr, this._buf4);
        }

        private set_pos(col: number = 0, page: number = 0) {
            this.cmd1(0xb0 | page) // page number
            let c = col * (this._ZOOM + 1)
            this.cmd1(0x00 | (c % 16)) // lower start column address
            this.cmd1(0x10 | (c >> 4)) // upper start column address
        }

        // clear bit
        private clrbit(d: number, b: number): number {
            if (d & (1 << b))
                d -= (1 << b)
            return d
        }

        /**
         * draw pixel in OLED
         * @param x is X alis, eg: 0
         * @param y is Y alis, eg: 0
         * @param color is dot color, eg: 1
         */
        //% blockId="SSD1306_drawPixel"
        //% block="draw pixel %ssd1306 at x %x|y %y|color %color"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public drawPixel(x: number, y: number, color: number = 1) {
            let page = y >> 3
            let shift_page = y % 8
            let ind = x * (this._ZOOM + 1) + page * 128 + 1
            let b = (color) ? (this._screen[ind] | (1 << shift_page)) : this.clrbit(this._screen[ind], shift_page)
            this._screen[ind] = b
            this.set_pos(x, page)
            if (this._ZOOM) {
                this._screen[ind + 1] = b
                this._buf3[0] = 0x40
                this._buf3[1] = this._buf3[2] = b
                pins.i2cWriteBuffer(this._I2CAddr, this._buf3)
            }
            else {
                this._buf2[0] = 0x40
                this._buf2[1] = b
                pins.i2cWriteBuffer(this._I2CAddr, this._buf2)
            }
        }

        /**
         * show text in OLED
         * @param x is X alis, eg: 0
         * @param y is Y alis, eg: 0
         * @param s is the text will be show, eg: 'Hello!'
         * @param color is string color, eg: 1
         */
        //% blockId="SSD1306_showString"
        //% block="show string %ssd1306 at x %x|y %y|text %s|color %color"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public showString(x: number, y: number, s: string, color: number = 1) {
            let col = 0
            let p = 0
            let ind = 0
            for (let n = 0; n < s.length; n++) {
                p = this.font[s.charCodeAt(n)]
                for (let i = 0; i < 5; i++) {
                    col = 0
                    for (let j = 0; j < 5; j++) {
                        if (p & (1 << (5 * i + j)))
                            col |= (1 << (j + 1))
                    }
                    ind = (x + n) * 5 * (this._ZOOM + 1) + y * 128 + i * (this._ZOOM + 1) + 1
                    if (color == 0)
                        col = 255 - col
                    this._screen[ind] = col
                    if (this._ZOOM)
                        this._screen[ind + 1] = col
                }
            }
            this.set_pos(x * 5, y)
            let ind0 = x * 5 * (this._ZOOM + 1) + y * 128
            let buf = this._screen.slice(ind0, ind + 1)
            buf[0] = 0x40
            pins.i2cWriteBuffer(this._I2CAddr, buf)
        }


        /**
         * show a number in OLED
         * @param x is X alis, eg: 0
         * @param y is Y alis, eg: 0
         * @param num is the number will be show, eg: 12
         * @param color is number color, eg: 1
         */
        //% blockId="SSD1306_showNumber"
        //% block="show a number %ssd1306 at x %x|y %y|number %num|color %color"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public showNumber(x: number, y: number, num: number, color: number = 1) {
            this.showString(x, y, num.toString(), color)
        }

        /**
         * draw a horizontal line
         * @param x is X alis, eg: 0
         * @param y is Y alis, eg: 0
         * @param len is the length of line, eg: 10
         * @param color is line color, eg: 1
         */
        //% blockId="SSD1306_drawHLine"
        //% block="draw a horizontal line %ssd1306 at x %x|y %y|number %len|color %color"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public drawHLine(x: number, y: number, len: number, color: number = 1) {
            for (let i = x; i < (x + len); i++)
                this.drawPixel(i, y, color)
        }

        /**
         * draw a vertical line
         * @param x is X alis, eg: 0
         * @param y is Y alis, eg: 0
         * @param len is the length of line, eg: 10
         * @param color is line color, eg: 1
         */
        //% blockId="SSD1306_drawVLine"
        //% block="draw a vertical line %ssd1306 at x %x|y %y|number %len|color %color"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public drawVLine(x: number, y: number, len: number, color: number = 1) {
            for (let i = y; i < (y + len); i++)
                this.drawPixel(x, i, color)
        }

        /**
         * draw a rectangle
         * @param x1 is X alis, eg: 0
         * @param y1 is Y alis, eg: 0
         * @param x2 is X alis, eg: 60
         * @param y2 is Y alis, eg: 30
         * @param color is line color, eg: 1
         */
        //% blockId="SSD1306_drawRect"
        //% block="draw a rectangle %ssd1306 at |x1 %x1 y1 %y1|x2 %x2 y2 %y2|with color %color"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public drawRect(x1: number, y1: number, x2: number, y2: number, color: number = 1) {
            if (x1 > x2)
                x1 = [x2, x2 = x1][0];
            if (y1 > y2)
                y1 = [y2, y2 = y1][0];
            this.drawHLine(x1, y1, x2 - x1 + 1, color)
            this.drawHLine(x1, y2, x2 - x1 + 1, color)
            this.drawVLine(x1, y1, y2 - y1 + 1, color)
            this.drawVLine(x2, y1, y2 - y1 + 1, color)
        }

        /**
         * invert display
         * @param d true: invert / false: normal, eg: true
         */
        //% blockId=SSD1306_invertOLED"
        //% block="invert oled display %ssd1306 %d"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public invertOLED(d: boolean = true) {
            let n = (d) ? 0xA7 : 0xA6
            this.cmd1(n)
        }

        /**
         * Render display screen
         */
        //% blockId="SSD1306_renderOLED"
        //% block="renderOLED %ssd1306"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public renderOLED() {
            this.set_pos()
            pins.i2cWriteBuffer(this._I2CAddr, this._screen)
        }

        /**
         * clear screen
         */
        //% blockId="SSD1306_clearOLED"
        //% block="clearOLED %ssd1306"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public clearOLED() {
            this._screen.fill(0)
            this._screen[0] = 0x40
            this.renderOLED()
        }

        /**
         * turn on screen
         */
        //% blockId="SSD1306_onOLED"
        //% block="turn on OLED %ssd1306"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public onOLED() {
            this.cmd1(0xAF)
        }

        /**
         * turn off screen
         */
        //% blockId="SSD1306_offOLED"
        //% block="turn off OLED %ssd1306"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public offOLED() {
            this.cmd1(0xAE)
        }

        /**
         * zoom mode
         * @param d true zoom / false normal, eg: true
         */
        //% blockId="SSD1306_zoomMode"
        //% block="zoom mode %ssd1306 %d"
        //% parts="SSD1306"
        //% subcategory="oled_ssd1306"
        public zoomMode(d: boolean = true) {
            this._ZOOM = (d) ? 1 : 0
            this.cmd2(0xd6, this._ZOOM)
        }

        /**
         * OLED initialize
         * @param addr is i2c addr, eg: 60
         */
        public initOLED(addr: number) {
            this._I2CAddr = addr;
            this.cmd1(0xAE)       // SSD1306_DISPLAYOFF
            this.cmd1(0xA4)       // SSD1306_DISPLAYALLON_RESUME
            this.cmd2(0xD5, 0xF0) // SSD1306_SETDISPLAYCLOCKDIV
            this.cmd2(0xA8, 0x3F) // SSD1306_SETMULTIPLEX
            this.cmd2(0xD3, 0x00) // SSD1306_SETDISPLAYOFFSET
            this.cmd1(0 | 0x0)    // line #SSD1306_SETSTARTLINE
            this.cmd2(0x8D, 0x14) // SSD1306_CHARGEPUMP
            this.cmd2(0x20, 0x00) // SSD1306_MEMORYMODE
            this.cmd3(0x21, 0, 127) // SSD1306_COLUMNADDR
            this.cmd3(0x22, 0, 63)  // SSD1306_PAGEADDR
            this.cmd1(0xa0 | 0x1) // SSD1306_SEGREMAP
            this.cmd1(0xc8)       // SSD1306_COMSCANDEC
            this.cmd2(0xDA, 0x12) // SSD1306_SETCOMPINS
            this.cmd2(0x81, 0xCF) // SSD1306_SETCONTRAST
            this.cmd2(0xd9, 0xF1) // SSD1306_SETPRECHARGE
            this.cmd2(0xDB, 0x40) // SSD1306_SETVCOMDETECT
            this.cmd1(0xA6)       // SSD1306_NORMALDISPLAY
            this.cmd2(0xD6, 1)    // zoom on
            this.cmd1(0xAF)       // SSD1306_DISPLAYON
            this.clearOLED()
            this._ZOOM = 1
        }
    }

    /**
     * create a SSD1306 object.
     * @param addr the i2c address of the oled, eg: 0x3C
     */
    //% blockId="SSD1306_create"
    //% block="Create OLED at I2C address %addr"
    //% subcategory="oled_ssd1306"
    export function create(addr: number): SSD1306 {
        let oled = new SSD1306();
        oled.initOLED(addr);
        return oled;
    }
}

