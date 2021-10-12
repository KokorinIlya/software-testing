import LoginPasswordForm from './LoginPasswordForm';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('LoginPasswordForm', () => {
    test('renders header', () => {
        const testRender = TestRenderer.create(
            <LoginPasswordForm
                onSuccessfulSubmit={jest.fn()}
                submitButtonName="Название"
                onBackFromCredentials={jest.fn()}
                submitFun={jest.fn()}
            />
        );
        const header = testRender.root
        expect(header.children[0].children[0].children).toEqual(['Название'])
    });

    test('calls callback on successful credentials submit', async () => {
        const mockedSubmit = jest.fn(async () => {
            return true
        })
        let promiseResolve
        let promise = new Promise((resolve) => {
            promiseResolve = resolve
        })
        const mockedOnSuccess = jest.fn(() => {
            promiseResolve()
        })
        const testRender = TestRenderer.create(
            <LoginPasswordForm
                onSuccessfulSubmit={mockedOnSuccess}
                submitButtonName="Название"
                onBackFromCredentials={jest.fn()}
                submitFun={mockedSubmit}
            />
        );
        const form = testRender.root.children[0].children[1].children[0]
        const loginField = form.children[0].children[1]
        const passwordField = form.children[1].children[1]
        loginField.props.onChange(
            {
                target: {
                    value: 'login'
                }
            }
        )
        passwordField.props.onChange(
            {
                target: {
                    value: 'password'
                }
            }
        )
        // noinspection JSUnresolvedFunction
        form.props.onSubmit(
            {
                preventDefault: jest.fn()
            }
        )
        expect(mockedSubmit.mock.calls.length).toBe(1)
        expect(mockedSubmit.mock.calls[0]).toEqual(['login', 'password'])
        await promise
        expect(mockedOnSuccess.mock.calls.length).toBe(1)
        expect(mockedOnSuccess.mock.calls[0]).toEqual(['login', 'password'])
    });

    test('renders error on unsuccessful credentials submit', async () => {
        const flushPromises = () => new Promise(setImmediate)
        const mockedSubmit = jest.fn(async () => {
            return false
        })
        const testRender = TestRenderer.create(
            <LoginPasswordForm
                onSuccessfulSubmit={jest.fn()}
                submitButtonName="Название"
                onBackFromCredentials={jest.fn()}
                submitFun={mockedSubmit}
            />
        );
        const form = testRender.root.children[0].children[1].children[0]
        const loginField = form.children[0].children[1]
        const passwordField = form.children[1].children[1]
        loginField.props.onChange(
            {
                target: {
                    value: 'login'
                }
            }
        )
        passwordField.props.onChange(
            {
                target: {
                    value: 'password'
                }
            }
        )
        // noinspection JSUnresolvedFunction
        form.props.onSubmit(
            {
                preventDefault: jest.fn()
            }
        )
        expect(mockedSubmit.mock.calls.length).toBe(1)
        expect(mockedSubmit.mock.calls[0]).toEqual(['login', 'password'])
        await flushPromises()
        const errorRectangle = testRender.root.children[0].children[1]
        expect(errorRectangle.children).toEqual(['Ошибка! Неверный логин и/или пароль'])
    });

    test('executes callback on returning', async () => {
        const mock = jest.fn()
        const testRender = TestRenderer.create(
            <LoginPasswordForm
                onSuccessfulSubmit={jest.fn()}
                submitButtonName="Название"
                onBackFromCredentials={mock}
                submitFun={jest.fn()}
            />
        );
        const button = testRender.root.children[0].children[2].children[0]
        expect(button.children).toEqual(['Назад'])
        // noinspection JSUnresolvedFunction
        button.props.onClick()
        expect(mock.mock.calls.length).toBe(1)
        expect(mock.mock.calls[0]).toEqual([])
    });
})
