export default class ChatClient {
    constructor(host, port, method = 'http') {
        this.baseString = `${method}://${host}:${port}`
    }

    async getChatData(chatId, userId) {
        const result = await fetch(
            `${this.baseString}/chat/${chatId}?userId=${userId}`, {
                cache: "no-cache"
            }
        )
        return await result.json()
    }

    async sendMessage(chatId, userId, messageText) {
        const result = await fetch(
            `${this.baseString}/send/${chatId}?userId=${userId}&message=${messageText}`,
            {
                cache: "no-cache"
            }
        )
        await result.json();
    }

    async closeChat(chatId, userId) {
        const result = await fetch(
            `${this.baseString}/close/${chatId}?userId=${userId}`,
            {
                cache: "no-cache"
            }
        )
        await result.json();
    }

    async startChat() {
        const result = await fetch(
            `${this.baseString}/connect`,
            {
                cache: "no-cache",
                method: 'POST'
            }
        )
        return await result.json()
    }

    async submitCredentials(login, password, submitType) {
        const result = await fetch(
            `${this.baseString}/${submitType}?login=${login}&password=${password}`,
            {
                cache: "no-cache"
            }
        )
        return result.status;
    }

    async register(login, password) {
        return await this.submitCredentials(login, password, "register")
    }

    async login(login, password) {
        return await this.submitCredentials(login, password, "login")
    }
}