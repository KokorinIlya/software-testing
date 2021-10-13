import {render, screen} from '@testing-library/react';
import SingleParticipantChat from './SingleParticipantChat';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('SingleParticipantChat', () => {
    test('renders waiting text', () => {
        render(<SingleParticipantChat/>);
        const linkElement = screen.getByText(/Ожидаем подключения второго участника.../i);
        expect(linkElement).toBeInTheDocument();
    })

    test('contains correct header text', () => {
        const testRender = TestRenderer.create(<SingleParticipantChat/>)
        const topChatBox = testRender.root.children[0]
        expect(topChatBox.children).toEqual([ 'Ожидаем подключения второго участника...' ])
    })
})
