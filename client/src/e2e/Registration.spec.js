import playwright from 'playwright'
import {test, expect} from '@playwright/test'
import {v4 as uuidv4} from 'uuid'

const delay = (time) => new Promise(res => setTimeout(res, time))

async function registerUser(page, newLogin) {
    const buttons = await page.$$('.menu-element')
    expect(await buttons[1].textContent()).toEqual('Зарегистрироваться')
    await buttons[1].click()
    const header = await page.$$('.top-rectangle')
    expect(await header[0].textContent()).toEqual('Зарегистрироваться')

    const password = 'password'
    const inputFields = await page.$$('.credentials-input')
    const loginInput = inputFields[0]
    const passwordInput = inputFields[1]
    await loginInput.fill(newLogin)
    await passwordInput.fill(password)
    const sendButton = await page.$$('.send-button')
    await sendButton[0].click()
    await delay(100)
}

test.describe('Registration', () => {
    let browser
    let context
    let page

    test.beforeEach(async () => {
        browser = await playwright.chromium.launch()
        context = await browser.newContext()
        page = await context.newPage()
        await page.goto('http://localhost:3000/')
    })

    test.afterEach(async () => {
        await browser.close()
    })

    test('new users can be registered', async () => {
        const newLogin = uuidv4()
        await registerUser(page, newLogin)
        const newButtons = await page.$$('.menu-element')
        expect(await newButtons[3].textContent()).toEqual(`Пользователь ${newLogin}`)
    })
})