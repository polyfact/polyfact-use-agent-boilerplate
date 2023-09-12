# `useAgent` Polyfact hook

The `useAgent` hook simplifies the interaction between your React application and the Polyfact agent.

## Installation

Firstly, ensure that you have the required `polyfact` library installed in your project.
yarn:

```
yarn add polyfact
```

or npm:

```
npm i polyfact
```

## Usage

### Importing the hook

You can import `useAgent` like any other named export:

```javascript
import { useAgent } from "polyfact/hooks";
```

### Initializing the hook

When using the `useAgent` hook, it should be initialized with the specific model and provider:

```javascript
const { start, stop } = useAgent({
  model: "gpt-4",
  provider: "openai",
});
```

### Starting the agent

To start an agent:

1. Define the task you want the agent to perform. (E.g., "How to make paw paw fruit jam?")
2. Use the `start` function returned by the `useAgent` hook.

```javascript
const startAgent = () => {
  if (polyfact && start) {
    start(task, callback);
  }
};
```

**Callback**: It's a function that captures the agent's progress. In our example, as the agent makes progress, the steps and results are updated:

```javascript
await start(task, (step: string, res: string) => {
  setProgress((prev) => [...prev, { step, res }]);
});
```

### Stopping the agent

To stop the agent in the middle of its task:

```javascript
stop();
```

For instance, in the `stopAgent` function:

```javascript
const stopAgent = () => {
  if (polyfact && stop) {
    stop();
  }
};
```

### Handling results

As the agent processes the task, the callback you passed to the `start` method will be called with the current `step` and `result`. You can handle them accordingly, like adding them to a progress list:

```javascript
setProgress((prev) => [...prev, { step, res }]);
```

### Error Handling

Always account for potential errors when working with external services:

```javascript
try {
    setIsStarted(true);
    await start(task, callback);
} catch (e: any) {
    console.error(e);
    setError(e.message);
}
```

When integrating into your UI, ensure you handle the various states an agent can be in, like loading, error, progress, etc.

## Conclusion

The `useAgent` hook offers a streamlined way to integrate Polyfact agents into your React applications. By following this guide, you can start, monitor, and control these agents, enhancing your application with their capabilities.
