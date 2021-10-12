import React from "react";
import EnterScreen from "../EnterScreen/EnterScreen";
import Chat from "../Chat/Chat";
import LoginPasswordForm from "../LoginPasswordForm/LoginPasswordForm";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: "enter",
            chatData: null,
            userData: null
        }
        this.chatManager = this.props.chatManager

        this.handleStartChat = this.handleStartChat.bind(this)
        this.handleChatClose = this.handleChatClose.bind(this)
        this.handleRegisterClick = this.handleRegisterClick.bind(this)
        this.handleLoginClick = this.handleLoginClick.bind(this)
        this.handleBackFromCredentials = this.handleBackFromCredentials.bind(this)
        this.handleSubmitCredentials = this.handleSubmitCredentials.bind(this)
    }

    async handleStartChat() {
        const chatData = await this.chatManager.startChat()
        this.setState({
            status: "chat",
            chatData: chatData
        })
    }

    handleBackFromCredentials() {
        this.setState({
            status: "enter",
            chatData: null
        })
    }

    handleRegisterClick() {
        this.setState({
            status: "register",
            chatData: null,
            userData: null
        })
    }

    handleLoginClick() {
        this.setState({
            status: "login",
            chatData: null,
            userData: null
        })
    }

    handleChatClose() {
        this.setState({
            status: "enter",
            chatData: null
        })
    }

    handleSubmitCredentials(login, password) {
        this.setState({
            status: "enter",
            chatData: null,
            userData: {
                login: login,
                password: password
            }
        })
    }

    render() {
        if (this.state.status === "enter") {
            return (
                <EnterScreen
                    onStartChatClick={this.handleStartChat}
                    onLoginClick={this.handleLoginClick}
                    onRegisterClick={this.handleRegisterClick}
                    userData={this.state.userData}
                />
            );
        } else if (this.state.status === "chat") {
            return (
                <Chat
                    chatId={this.state.chatData.chatId}
                    userId={this.state.chatData.userId}
                    messages={this.state.chatData.messages}
                    finished={this.state.chatData.finished}
                    chatManager={this.chatManager}
                    onChatClose={this.handleChatClose}
                />
            );
        } else if (this.state.status === "login") {
            return (
                <LoginPasswordForm
                    onSuccessfulSubmit={this.handleSubmitCredentials}
                    onBackFromCredentials={this.handleBackFromCredentials}
                    submitButtonName="Войти"
                    submitFun={(login, password) => {
                        return this.chatManager.login(login, password)
                    }}
                />
            );
        } else if (this.state.status === "register") {
            return (
                <LoginPasswordForm
                    onSuccessfulSubmit={this.handleSubmitCredentials}
                    onBackFromCredentials={this.handleBackFromCredentials}
                    submitButtonName="Зарегистрироваться"
                    submitFun={(login, password) => {
                        return this.chatManager.register(login, password)
                    }}
                />
            );
        } else {
            alert('ERROR: Unknown state')
        }
    }
}

export default App;
