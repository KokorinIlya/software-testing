import playwright from 'playwright'
import {test, expect} from '@playwright/test'

const delay = (time) => new Promise(res => setTimeout(res, time))

async function startChat(page, isFirst) {
    const buttons = await page.$$('.menu-element')
    expect(await buttons[0].textContent()).toEqual('Начать чат')
    await buttons[0].click()
    await delay(100)
    const header = await page.$$('.top-rectangle')
    expect(await header[0].textContent()).toEqual('Активный чат')
    const chatStatus = await page.$$('.empty-chat-box')
    if (isFirst) {
        expect(await chatStatus[0].textContent()).toEqual('Ожидаем подключения второго участника...')
    } else {
        expect(chatStatus.length).toBe(0)
    }
}

async function reload(page) {
    const buttons = await page.$$('.menu-element')
    expect(await buttons[buttons.length - 1].textContent()).toEqual('Обновить страницу')
    await buttons[buttons.length - 1].click()
    await delay(100)
}

async function getMessages(page) {
    const messages = await page.$$('.message')
    const res = []
    for (const message of messages) {
        const text = await message.textContent()
        res.push(text)
    }
    const header = await page.$$('.top-rectangle')
    const status = await header[0].textContent()
    return {
        messages: res,
        chatStatus: status
    }
}

async function sendMessage(page, message) {
    const input = await page.$$('.message-input')
    await input[0].fill(message)
    const sendButton = await page.$$('.send-button')
    await sendButton[0].click()
    await delay(100)
}

async function closeChat(page) {
    const buttons = await page.$$('.menu-element')
    expect(await buttons[buttons.length - 2].textContent()).toEqual('Завершить чат')
    await buttons[buttons.length - 2].click()
    await delay(100)
}

test.describe('Chat', () => {
    const browsers = []
    const pages = []

    test.beforeEach(async () => {
        for (const port of [3000, 4000]) {
            const browser = await playwright.chromium.launch()
            const context = await browser.newContext()
            const page = await context.newPage()
            await page.goto(`http://localhost:${port}/`)
            pages.push(page)
            browsers.push(browser)
        }
    })

    test.afterEach(async () => {
        for (let i = 0; i < 2; i += 1) {
            await browsers[i].close()
        }
    })

    test('users can exchange messages', async () => {
        await startChat(pages[0], true)
        await startChat(pages[1], false)
        await reload(pages[0])
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [],
                chatStatus: 'Активный чат'
            }
        )
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [],
                chatStatus: 'Активный чат'
            }
        )
        await sendMessage(pages[0], 'Hello!')
        await sendMessage(pages[0], 'Hello again')
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [
                    'Я: Hello!',
                    'Я: Hello again'
                ],
                chatStatus: 'Активный чат'
            }
        )
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [],
                chatStatus: 'Активный чат'
            }
        )
        await reload(pages[1])
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [
                    'Собеседник: Hello!',
                    'Собеседник: Hello again'
                ],
                chatStatus: 'Активный чат'
            }
        )
        await sendMessage(pages[1], 'Hello you too!')
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [
                    'Собеседник: Hello!',
                    'Собеседник: Hello again',
                    'Я: Hello you too!'
                ],
                chatStatus: 'Активный чат'
            }
        )
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [
                    'Я: Hello!',
                    'Я: Hello again'
                ],
                chatStatus: 'Активный чат'
            }
        )
        await sendMessage(pages[0], 'Bye!')
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [
                    'Я: Hello!',
                    'Я: Hello again',
                    'Собеседник: Hello you too!',
                    'Я: Bye!'
                ],
                chatStatus: 'Активный чат'
            }
        )
        await closeChat(pages[0])
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [
                    'Я: Hello!',
                    'Я: Hello again',
                    'Собеседник: Hello you too!',
                    'Я: Bye!'
                ],
                chatStatus: 'Завершённый чат'
            }
        )
        await reload(pages[1])
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [
                    'Собеседник: Hello!',
                    'Собеседник: Hello again',
                    'Я: Hello you too!',
                    'Собеседник: Bye!'
                ],
                chatStatus: 'Завершённый чат'
            }
        )
    })
})