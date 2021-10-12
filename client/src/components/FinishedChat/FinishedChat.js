import React from "react";
import '../../style/common.css';
import MessageList from "../MessageList/MessageList";

function FinishedChat({userId, messages, onChatClose}) {
    if (messages == null) {
        messages = []
    }
    return (
        <>
            <div className="top-rectangle" align="center">
                Завершённый чат
            </div>
            <div align="center">
                <MessageList messages={messages} userId={userId}/>
                <div className="button-holder">
                    <button className="menu-element" onClick={onChatClose}>Вернуться в приложение</button>
                </div>
            </div>
        </>
    );
}

export default FinishedChat;