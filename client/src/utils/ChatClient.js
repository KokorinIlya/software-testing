export default class ChatClient {
    constructor(host, port, method = 'http') {
        this.baseString = `${method}://${host}:${port}`
    }

    async getChatData(chatId, userId) {
        const result = await fetch(
            `${this.baseString}/chat/${chatId}?userId=${userId}`, {
                cache: "no-cache",
                headers: {
                    'Accept': 'application/json'
                },
            }
        )
        return await result.json()
    }

    async sendMessage(chatId, userId, messageText) {
        const result = await fetch(
            `${this.baseString}/send/${chatId}`,
            {
                cache: "no-cache",
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        userId: userId,
                        message: messageText
                    }
                )
            }
        )
        await result.json();
    }

    async closeChat(chatId, userId) {
        const result = await fetch(
            `${this.baseString}/close/${chatId}`,
            {
                cache: "no-cache",
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        userId: userId
                    }
                )
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
            `${this.baseString}/${submitType}`,
            {
                cache: "no-cache",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        login: login,
                        password: password
                    }
                )
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