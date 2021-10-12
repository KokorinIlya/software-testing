import React from "react";
import '../../style/common.css';
import './NewMessageForm.css'

class NewMessageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newMessage: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({
            newMessage: event.target.value
        });
    }

    handleSubmit(event) {
        this.props.onSendMessage(this.state.newMessage)
        this.setState({
            newMessage: ''
        })
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="menu-element">
                <label>
                    Новое сообщение:
                    <textarea value={this.state.newMessage} onChange={this.handleChange}
                              cols={50} rows={5} className="message-input"/>
                </label>
                <input type="submit" value="Отправить" className="send-button"/>
            </form>
        );
    }
}

export default NewMessageForm;