import React from 'react';
import '../../style/common.css';

function EnterScreen({onStartChatClick, onRegisterClick, onLoginClick, userData}) {
    let userButton = <></>
    if (userData !== null) {
        userButton = (
            <div className="button-holder">
                <button className="menu-element">Пользователь {userData.login}</button>
            </div>
        )
    }
    return (
        <>
            <div className="top-rectangle" align="center">
                Очередное приложение с чатами
            </div>
            <div align="center">
                <div className="button-holder">
                    <button className="menu-element" onClick={onStartChatClick}>Начать чат</button>
                </div>
                <div className="button-holder">
                    <button className="menu-element" onClick={onRegisterClick}>Зарегистрироваться</button>
                </div>
                <div className="button-holder">
                    <button className="menu-element" onClick={onLoginClick}>Войти</button>
                </div>
                {userButton}
            </div>
        </>
    );
}

export default EnterScreen;