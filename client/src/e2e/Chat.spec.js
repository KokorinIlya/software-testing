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
    let browsers
    let pages

    test.beforeEach(async () => {
        browsers = []
        pages = []
        for (const port of [3000, 4000]) {
            const browser = await playwright.chromium.launch()
            const page = await browser.newPage()
            await page.goto(`http://localhost:${port}/`)
            pages.push(page)
            browsers.push(browser)
        }
    })

    test.afterEach(async () => {
        for (const browser of browsers) {
            await browser.close()
        }
    })

    test('chat is updated on send message', async () => {
        await startChat(pages[0], true)
        await startChat(pages[1], false)
        await reload(pages[0])
        await sendMessage(pages[0], 'Hello!')
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [],
                chatStatus: 'Активный чат'
            }
        )
        await sendMessage(pages[1], 'World!')
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [
                    'Собеседник: Hello!',
                    'Я: World!'
                ],
                chatStatus: 'Активный чат'
            }
        )
    })

    test('chat is updated on reload', async () => {
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
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [
                    'Я: Hello!'
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
                    'Собеседник: Hello!'
                ],
                chatStatus: 'Активный чат'
            }
        )
    })

    test('chat is updated on finish', async () => {
        await startChat(pages[0], true)
        await startChat(pages[1], false)
        await reload(pages[0])
        await sendMessage(pages[0], 'Hello!')
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [],
                chatStatus: 'Активный чат'
            }
        )
        await closeChat(pages[1])
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [
                    'Собеседник: Hello!'
                ],
                chatStatus: 'Завершённый чат'
            }
        )
    })

    test('chat is finished on reload', async () => {
        await startChat(pages[0], true)
        await startChat(pages[1], false)
        await reload(pages[0])
        await closeChat(pages[1])
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [],
                chatStatus: 'Завершённый чат'
            }
        )
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [],
                chatStatus: 'Активный чат'
            }
        )
        await reload(pages[0])
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [],
                chatStatus: 'Завершённый чат'
            }
        )
    })

    test('chat is finished on chat finish', async () => {
        await startChat(pages[0], true)
        await startChat(pages[1], false)
        await reload(pages[0])
        await closeChat(pages[1])
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [],
                chatStatus: 'Завершённый чат'
            }
        )
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [],
                chatStatus: 'Активный чат'
            }
        )
        await closeChat(pages[0])
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [],
                chatStatus: 'Завершённый чат'
            }
        )
    })

    test('chat is finished on send message', async () => {
        await startChat(pages[0], true)
        await startChat(pages[1], false)
        await reload(pages[0])
        await closeChat(pages[1])
        expect(await getMessages(pages[1])).toEqual(
            {
                messages: [],
                chatStatus: 'Завершённый чат'
            }
        )
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [],
                chatStatus: 'Активный чат'
            }
        )
        await sendMessage(pages[0], 'Message')
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [],
                chatStatus: 'Завершённый чат'
            }
        )
    })

    test('users can return to application from finished chats', async () => {
        await startChat(pages[0], true)
        await closeChat(pages[0])
        expect(await getMessages(pages[0])).toEqual(
            {
                messages: [],
                chatStatus: 'Завершённый чат'
            }
        )
        const buttons = await pages[0].$$('.menu-element')
        expect(buttons.length).toBe(1)
        expect(await buttons[0].textContent()).toEqual('Вернуться в приложение')
        await buttons[0].click()
        await delay(100)
        const title = await pages[0].$$('.top-rectangle')
        expect(await title[0].textContent()).toEqual('Очередное приложение с чатами')
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