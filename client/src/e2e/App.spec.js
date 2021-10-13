import {test, expect} from '@playwright/test';

test.describe('App', () => {
    test('renders application name', async ({page}) => {
        await page.goto('http://localhost:3000/')
        const title = page.locator('.top-rectangle')
        await expect(title).toHaveText('Очередное приложение с чатами')
    })

    test('renders action buttons', async ({page}) => {
        await page.goto('http://localhost:3000/')
        const buttons = await page.$$('.menu-element')
        expect(buttons.length).toBe(3)
        expect(await buttons[0].textContent()).toEqual('Начать чат')
        expect(await buttons[1].textContent()).toEqual('Зарегистрироваться')
        expect(await buttons[2].textContent()).toEqual('Войти')
    })
})