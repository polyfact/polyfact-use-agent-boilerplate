# `useAgent` React Boilerplate

## Preliminary Steps

### 1. Login to Polyfact

Before using the `useAgent` hook, you need to be authenticated on the Polyfact platform. The `usePolyfact` hook provides a convenient `login` method to assist with this:

```javascript
const { login } = usePolyfact(options);
```

To allow a user to login with their preferred provider (e.g., Google), you can provide a button:

```javascript
<button onClick={() => login({ provider: "google" })}>Login with Google</button>
```

### 2. Obtain a Project ID

After logging in to Polyfact:

1. Navigate to the Polyfact dashboard at [app.polyfact.com](https://app.polyfact.com).
2. Create a new project or select an existing one.
3. Retrieve the `PROJECT_ID` from the project details.

This `PROJECT_ID` should be provided when initializing the `usePolyfact` hook:

```javascript
const { polyfact, login, loading } = usePolyfact({
  project: "<PROJECT_ID>",
});
```

Certainly! You can add more detail to make the installation steps clearer by providing the actual command-line instructions for both npm and yarn. Here's how you could enhance the "Installation" section:

## Installation

Before you can use the `useAgent` and `usePolyfact` hooks in your project, you need to install the `polyfact` library. You can do so using either npm or yarn:

### Using npm:

Run the following command in your project directory:

```bash
npm install polyfact --save
```

### Using yarn:

If you prefer yarn, run this command instead:

```bash
yarn add polyfact
```

After successfully installing the package, you're ready to import and use the hooks in your application.

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
  model: "gpt-4", // prefered gpt-4 for better stability.
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

To stop the agent (it completes its current task before):

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
