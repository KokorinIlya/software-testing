import React from "react";
import '../../style/common.css';
import SingleParticipantChat from "../SingleParticipantChat/SingleParticipantChat";
import BothParticipantsChat from "../BothParticipantsChat/BothParticipantsChat";

function ActiveChat({userId, messages, onSendMessage, onChatClose, onReloadButton}) {
    let chatBox
    if (messages === null) {
        chatBox = <SingleParticipantChat/>
    } else {
        chatBox = <BothParticipantsChat
            messages={messages}
            onSendMessage={onSendMessage}
            userId={userId}
        />
    }

    return (
        <>
            <div className="top-rectangle" align="center">
                Активный чат
            </div>
            <div align="center">
                {chatBox}
                <div className="button-holder">
                    <button className="menu-element" onClick={onChatClose}>Завершить чат</button>
                </div>
                <div className="button-holder">
                    <button className="menu-element" onClick={onReloadButton}>
                        Обновить страницу
                    </button>
                </div>
            </div>
        </>
    );
}

export default ActiveChat;