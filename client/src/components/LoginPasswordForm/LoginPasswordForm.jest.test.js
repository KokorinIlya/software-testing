import LoginPasswordForm from './LoginPasswordForm';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('LoginPasswordForm', () => {
    test('submits login and password', () => {
        const mockedSubmit = jest.fn()
        const testRender = TestRenderer.create(
            <LoginPasswordForm
                onSuccessfulSubmit={jest.fn()}
                submitButtonName="Название"
                onBackFromCredentials={jest.fn()}
                submitFun={mockedSubmit}
            />
        );
        // TODO
    });
})
