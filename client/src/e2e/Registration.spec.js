import playwright from 'playwright'
import {test, expect} from '@playwright/test'
import {v4 as uuidv4} from 'uuid'

const delay = (time) => new Promise(res => setTimeout(res, time))

async function submitCredentials(page, login, password) {
    const inputFields = await page.$$('.credentials-input')
    const loginInput = inputFields[0]
    const passwordInput = inputFields[1]
    await loginInput.fill(login)
    await passwordInput.fill(password)
    const sendButton = await page.$$('.send-button')
    await sendButton[0].click()
    await delay(100)
}

async function registerUser(page, newLogin, password) {
    const buttons = await page.$$('.menu-element')
    expect(await buttons[1].textContent()).toEqual('Зарегистрироваться')
    await buttons[1].click()
    const header = await page.$$('.top-rectangle')
    expect(await header[0].textContent()).toEqual('Зарегистрироваться')
    await submitCredentials(page, newLogin, password)
}

async function loginUser(page, login, password) {
    const buttons = await page.$$('.menu-element')
    expect(await buttons[2].textContent()).toEqual('Войти')
    await buttons[2].click()
    const header = await page.$$('.top-rectangle')
    expect(await header[0].textContent()).toEqual('Войти')
    await submitCredentials(page, login, password)
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
        await registerUser(page, newLogin, 'password')
        const newButtons = await page.$$('.menu-element')
        expect(await newButtons[3].textContent()).toEqual(`Пользователь ${newLogin}`)
    })

    test('multiple users cannot be registered by the same login', async () => {
        const newLogin = uuidv4()
        await registerUser(page, newLogin, 'pass_1')
        const newButtons = await page.$$('.menu-element')
        expect(await newButtons[3].textContent()).toEqual(`Пользователь ${newLogin}`)

        await registerUser(page, newLogin, 'pass_2')
        const newRectangles = await page.$$('.top-rectangle')
        expect(await newRectangles[1].textContent()).toEqual('Ошибка! Неверный логин и/или пароль')
    })

    test('users can log in after registration', async () => {
        const newLogin = uuidv4()
        await registerUser(page, newLogin, 'password')
        await loginUser(page, newLogin, 'password')

        const newButtons = await page.$$('.menu-element')
        expect(await newButtons[3].textContent()).toEqual(`Пользователь ${newLogin}`)
    })

    test('users cannot log in with wrong password', async () => {
        const newLogin = uuidv4()
        await registerUser(page, newLogin, 'password')
        await loginUser(page, newLogin, 'wrong_pass')

        const newRectangles = await page.$$('.top-rectangle')
        expect(await newRectangles[1].textContent()).toEqual('Ошибка! Неверный логин и/или пароль')
    })

    test('non-registered users cannot log in', async () => {
        const newLogin = uuidv4()
        await loginUser(page, newLogin, 'password')

        const newRectangles = await page.$$('.top-rectangle')
        expect(await newRectangles[1].textContent()).toEqual('Ошибка! Неверный логин и/или пароль')
    })

    test('users can return from auth page', async () => {
        const buttons = await page.$$('.menu-element')
        expect(await buttons[1].textContent()).toEqual('Зарегистрироваться')
        await buttons[1].click()
        const header = await page.$$('.top-rectangle')
        expect(await header[0].textContent()).toEqual('Зарегистрироваться')
        const newButtons = await page.$$('.menu-element')
        expect(await newButtons[1].textContent()).toEqual('Назад')
        await newButtons[1].click()
        const title = page.locator('.top-rectangle')
        await expect(title).toHaveText('Очередное приложение с чатами')
    })
})