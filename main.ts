/**
* LCD2004顯示器的函數
*/

// % weight=0 color=#794044 icon="\uf108"
// block="LCD2004"
namespace lcd2004 {
    export let LCD_I2C_ADDR = 0x3f
    let buf = 0x00
    let BK = 0x08
    //let BK = 0x20  //3 line
    //let BK = 0x80  //4 line
    let RS = 0x00
    let E = 0x04

    function setReg(dat: number): void {
        pins.i2cWriteNumber(LCD_I2C_ADDR, dat, NumberFormat.UInt8BE, false)
        basic.pause(1)
    }

    function send(dat: number): void {
        let d = dat & 0xF0
        //let d = dat & 0xC0
        d |= BK
        d |= RS
        setReg(d)
        setReg(d | 0x04)
        setReg(d)
    }

    function setcmd(cmd: number): void {
        RS = 0
        send(cmd)
        send(cmd << 4)
    }

    function setdat(dat: number): void {
        RS = 1
        send(dat)
        send(dat << 4)
    }

    export enum I2C_ADDR {
        //% block="0x27"
        addr1 = 0x27,
        //% block="0x3f"
        addr2 = 0x3f,
        //% block="0x20"
        addr3 = 0x20,
        //% block="0x62"
        addr4 = 0x62,
        //% block="0x3e"
        addr5 = 0x3e
    }
    export enum on_off {
        //% block="on"
        on = 1,
        //% block="off"
        off = 0
    }

    export enum visibled {
        //% block="visibled"
        visible = 1,
        //% block="invisibled"
        invisible = 0
    }

    function setI2CAddress(): void {
        setcmd(0x33)
        basic.pause(5)
        send(0x30)
        basic.pause(5)
        send(0x20)
        basic.pause(5)
        setcmd(0x28)
        setcmd(0x0C)
        setcmd(0x06)
        setcmd(0x01)
    }

    //% blockId="LCD_setAddress" block="LCD2004 I2C address %myAddr"
    //% weight=0 blockExternalInputs=true
    export function setAddress(myAddr: I2C_ADDR): void {
        LCD_I2C_ADDR = myAddr
        setI2CAddress()
    }

    //% blockId="LCD_setAddress2" block="LCD2004 I2C address %myAddr"
    //% weight=7 blockExternalInputs=true
    export function setAddress2(myAddr: number): void {
        LCD_I2C_ADDR = myAddr
        setI2CAddress()
    }

    //% blockId="LCD_clear" block="LCD clear"
    //% weight=2
    export function clear(): void {
        setcmd(0x01)
    }

    //% blockId="LCD_backlight" block="set LCD backlight %on"
    //% weight=3
    export function set_backlight(on: on_off): void {
        if (on == 1)
            BK = 0x08
        //BK = 0x80
        else
            BK = 0x00
        setcmd(0x00)
    }

    //% blockId="LCD_Show" block="set string %show"
    //% weight=4
    export function set_LCD_Show(show: visibled): void {
        if (show == 1)
            setcmd(0x0C)
        else
            setcmd(0x08)
    }

    function printChar(ch: number, x: number, y: number): void {
        if (x >= 0) {
            let a = 0x80
            if (y > 0)
                a = 0xC0

            if (y == 0) {
                a = 0xC0
                a = a + (2 * 20) + x
                //顯示第一行
            }
            else if (y == 1) {
                a = 0xC0
                a = a + x
                //顯示第二行
            }
            else if (y == 2) {
                a = 0xC0
                //a = a + (2 * 20) + x - 4
                a = a + (-2 * 20) + x - 4
                //顯示第三行
            }
            else if (y == 3) {
                a = 0xC0
                a = a + 20 + x
                //顯示第四行
            }
            else {
                a += x
            }
            setcmd(a)
        }
        setdat(ch)
    }

    //% blockId="LCD_putString" block="LCD show string %s|on x:%x|y:%y"
    //% weight=6 blockExternalInputs=true x.min=0 x.max=19 y.min=0 y.max=3
    export function putString(s: string, x: number, y: number): void {
        if (s.length > 0) {
            x=0 //關閉x
            let breakPoint = -1
            printChar(s.charCodeAt(0), x, y)
            if (y == 0)
                breakPoint = 20 - x
            for (let i = 1; i < s.length; i++) {
                if (i == breakPoint)
                    printChar(s.charCodeAt(i), 0, 1)
                else
                    printChar(s.charCodeAt(i), -1, 0)
            }
        }
    }
    //% blockId="LCD_putNumber" block="LCD show number %n|on x:%x|y:%y"
    //% weight=5 blockExternalInputs=true x.min=0 x.max=19 y.min=0 y.max=3
    export function putNumber(n: number, x: number, y: number): void {
        putString(n.toString(), x, y)
    }

}
