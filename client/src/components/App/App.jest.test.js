import {render, screen} from '@testing-library/react';
import App from './App';
import React from "react";
import ChatManager from "../../utils/ChatManager";

describe('App', () => {
    test('renders application name', () => {
        const mockedChatClient = {
            getChatData: jest.fn(),
            sendMessage:jest.fn(),
            closeChat: jest.fn(),
            startChat: jest.fn(),
        }
        const mockedChatManager = new ChatManager(mockedChatClient)
        render(<App chatManager={mockedChatManager}/>);
        const linkElement = screen.getByText(/Очередное приложение с чатами/i);
        expect(linkElement).toBeInTheDocument();
    });
})
