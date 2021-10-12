import React from "react";

import './SingleParticipantChat.css';

function SingleParticipantChat({onChatClose}) {
    return (
        <>
            <div className="empty-chat-box">
                Ожидаем подключения второго участника...
            </div>
            <div className="button-holder">
                <button className="menu-element" onClick={onChatClose}>Завершить чат</button>
            </div>
        </>
    );
}

export default SingleParticipantChat;