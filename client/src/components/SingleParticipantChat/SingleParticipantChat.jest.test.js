import {render, screen} from '@testing-library/react';
import SingleParticipantChat from './SingleParticipantChat';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('SingleParticipantChat', () => {
    test('renders waiting text', () => {
        render(<SingleParticipantChat onChatClose={jest.fn()}/>);
        const linkElement = screen.getByText(/Ожидаем подключения второго участника.../i);
        expect(linkElement).toBeInTheDocument();
    });

    test('contains correct header text', () => {
        const testRender = TestRenderer.create(<SingleParticipantChat onChatClose={jest.fn()}/>);
        const topChatBox = testRender.root.children[0]
        expect(topChatBox.children).toEqual([ 'Ожидаем подключения второго участника...' ])
    });

    test('performs chat closing on button click', () => {
        const onClickMock = jest.fn()
        const testRender = TestRenderer.create(<SingleParticipantChat onChatClose={onClickMock}/>);
        const button = testRender.root.children[1].children[0]
        // noinspection JSUnresolvedFunction
        button.props.onClick()
        expect(button.children).toEqual(['Завершить чат'])
        expect(onClickMock.mock.calls.length).toBe(1)
    });
})
