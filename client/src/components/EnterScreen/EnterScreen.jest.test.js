import EnterScreen from './EnterScreen';
import React from "react";
import TestRenderer from "react-test-renderer";
import {render, screen} from '@testing-library/react';

describe('EnterScreen', () => {
    test('renders text', () => {
        render(<EnterScreen onStartChatClick={jest.fn()} userData={null}/>);
        ["Очередное приложение с чатами", "Начать чат",
            "Зарегистрироваться", "Войти"].forEach((text) => {
            const linkElement = screen.getByText(text);
            expect(linkElement).toBeInTheDocument();
        })
    });

    test('renders pressable start chat button', () => {
        const mock = jest.fn()
        const testRender = TestRenderer.create(<EnterScreen onStartChatClick={mock} userData={null}/>);
        const buttons = testRender.root.findAllByType('button')
        expect(buttons[0].children).toEqual(['Начать чат'])
        // noinspection JSUnresolvedFunction
        buttons[0].props.onClick()
        expect(mock.mock.calls.length).toBe(1)
    });

    test('renders user login when logged in', () => {
        render(<EnterScreen
            onStartChatClick={jest.fn()}
            userData={{login: "login", password: "password"}}
        />);
        const linkElement = screen.getByText('Пользователь login');
        expect(linkElement).toBeInTheDocument();
    });

    test('adds user login to the DOM when logged in', () => {
        const testRender = TestRenderer.create(<EnterScreen
            onStartChatClick={jest.fn()}
            userData={{login: "login", password: "password"}}
        />);
        const userData = testRender.root.children[1].children[3].children[0]
        expect(userData.children).toEqual(['Пользователь ', 'login'])
        expect(testRender.root.children[1].children.length).toBe(4)
    });

    test('does not add user login to the DOM when not logged in', () => {
        const testRender = TestRenderer.create(<EnterScreen
            onStartChatClick={jest.fn()}
            userData={null}
        />);
        expect(testRender.root.children[1].children.length).toBe(3)
    });
})
