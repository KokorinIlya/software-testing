# Ненаписанные тесты

Я не написал некоторые unit-тесты на `ChatRepo`, так как в коде 
непротестированных метдов использовалась функция 
`SuspendConnection.inTransaction<T> :: (suspend (SuspendConnection) -> T) -> T`, 
которая выполняет переданную ей в качестве аргумента функцию в отдельной
транзакции и возвращает результат.

Для мока этой функции я пытался использовать нижеследующую конструкцию:

```kotlin
val mockedConnection = mock(SuspendingConnection::class.java)
val mockedTransactionConn = mock(SuspendingConnection::class.java)

`when`(mockedConnection.inTransaction<Unit>(any()))
    .thenAnswer { invocation ->
        val callback = invocation.getArgument(0) as suspend (SuspendingConnection) -> Unit
        return callback(mockedTransactionConn)
        /*
        Передаём в коллбек-аргумент замоканное транзакционное подключение
        чтобы контролировать, какие результаты будут возвращать запросы,
        исполненные в рамках транзакции
        */
    }
```

Но этот код не работает, так как `thenAnswer` определена без модификатора 
`suspend`, следовательно, в её коде нельзя делать вызовы `suspend`-функций.

Можно попробовать оборачивать вызов `callback` в `runBlocking`

```kotlin
`when`(mockedConnection.inTransaction<Unit>(any()))
    .thenAnswer { invocation ->
        val callback = invocation.getArgument(0) as suspend (SuspendingConnection) -> Unit
        return runBlocking { callback(mockedTransactionConn) }
    }
``` 
но после этого тестирующий фреймворк просто сходит с ума, начинают падать другие тесты, при этом ошибки в 
логах (даже других упавших тестов) указывают на строку внутри теста с моком `inTransaction`.

Видимо, для моков нужно использовать библиотеку, которая нативно поддерживает корутины,
 например [mockk](https://mockk.io/)