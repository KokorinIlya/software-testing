import React from "react";
import '../../style/common.css';
import './LoginPasswordForm.css'

class LoginPasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: '',
            password: '',
            hasError: false
        };
        this.onSuccessfulSubmit = this.props.onSuccessfulSubmit
        this.submitButtonName = this.props.submitButtonName
        this.onBackFromCredentials = this.props.onBackFromCredentials
        this.submitFun = this.props.submitFun

        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleLoginChange(event) {
        this.setState({
            login: event.target.value
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        const status = await this.submitFun(this.state.login, this.state.password)
        if (status) {
            this.onSuccessfulSubmit(this.state.login, this.state.password)
        } else {
            this.setState({
                hasError: true
            })
        }
    }

    render() {
        let errorRectangle = <></>
        if (this.state.hasError) {
            errorRectangle = (
                <div className="top-rectangle">
                    Ошибка! Неверный логин и/или пароль
                </div>
            );
        }
        return (
            <div align="center">
                <div className="top-rectangle">
                    {this.submitButtonName}
                </div>
                {errorRectangle}
                <div className="button-holder">
                    <form onSubmit={this.handleSubmit} className="menu-element">
                        <label>
                            Логин:
                            <input type="text" value={this.state.login} onChange={this.handleLoginChange}
                                   className="credentials-input"/>
                        </label>
                        <label>
                            Пароль:
                            <input type="text" value={this.state.password} onChange={this.handlePasswordChange}
                                   className="credentials-input"/>
                        </label>
                        <input type="submit" value={this.submitButtonName} className="send-button"/>
                    </form>
                </div>
                <div className="button-holder">
                    <button className="menu-element" onClick={this.onBackFromCredentials}>Назад</button>
                </div>
            </div>
        );
    }
}

export default LoginPasswordForm;