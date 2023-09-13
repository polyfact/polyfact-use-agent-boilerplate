import "./App.css";
import "bulma/css/bulma.min.css";
import { useState } from "react";
import { usePolyfact, useAgent } from "polyfact/hooks";
import { examples } from "./examples";
import { TDefinitionAction } from "./useAgent";

/**
 * Main App Component
 * Provides functionality to:
 * 1. Login to the system
 * 2. Start an agent with a specified task
 * 3. Show the agent's progress and provide control to stop/restart the agent
 */
export default function App() {
  // Hooks to interact with Polyfact and Agent
  const { polyfact, login, loading } = usePolyfact({
    project: "ecd1afb6-4756-42c3-ac6f-7693afa3038b", // You get one from https://app.polyfact.com
  });

  const search = async (request: string) => {
    const page = await polyfact?.generate(request, {
      web: true,
    });

    return page;
  };

  const summarize = async (content: string) => {
    const page = await polyfact?.generate(`summarize this text : ${content}`);

    return page;
  };

  const actions: TDefinitionAction[] = [
    {
      name: "Search",
      description: "Use this action if you have to search on the web",
      callback: search,
      example: examples[0],
    },
    {
      name: "summarize",
      description: "Use this action if you have to summarize a text",
      callback: summarize,
      example: examples[1],
    },
  ];

  const { start, stop } = useAgent(actions, {
    model: "gpt-4", // gpt-4 model for better stability
    provider: "openai",
  });

  const [progress, setProgress] = useState<{ step: string; res: string }[]>([]);
  const [error, setError] = useState<string>();
  const [isStarted, setIsStarted] = useState(false);
  const [task, setTask] = useState<string>("How to do paw paw fruit jam ?");

  /**
   * Starts the agent with the given task
   */
  const startAgent = () => {
    if (polyfact && start) {
      const getResponse = async () => {
        try {
          setIsStarted(true);

          await start(task, (step: string, res: string) => {
            setProgress((prev) => [...prev, { step, res }]);
          });
        } catch (e: any) {
          console.error(e);
          setError(e.message);
        }
      };
      getResponse();
    }
  };

  /**
   * Stops the agent and clears its progress
   */
  const stopAgent = () => {
    if (polyfact && stop) {
      stop();
      setProgress([]);
      setIsStarted(false);
    }
  };

  /**
   * Resets the agent to accept a new task
   */
  const restartAgent = () => {
    setIsStarted(false);
    setError(undefined);
    setProgress([]);
    setTask("");
  };

  const loginButton = login && (
    <button onClick={() => login({ provider: "google" })} className="login-btn">
      Login with Google
    </button>
  );

  const errorDisplay = `Error: ${error}`;

  const agentDisplay = (
    <div
      className="columns is-multiline"
      style={{ height: "100vh", overflowY: "scroll" }}
    >
      {progress.map((p, index) => (
        <div className="column is-full" key={index}>
          <div className="box">
            <h1 className="title is-4 is-uppercase">{p.step}</h1>
            <hr />
            <div className="content">{p.res}</div>
            {p.step !== "finish" && index === progress.length - 1 && (
              <button
                onClick={stopAgent}
                className="button is-primary is-medium"
              >
                stop
              </button>
            )}
            {p.step === "finish" && (
              <button
                onClick={restartAgent}
                className="button is-primary is-medium"
              >
                New Request
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const taskInputDisplay = (
    <div className="columns is-multiline">
      <div className="column is-flex is-full is-justify-content-center">
        <input
          className="input"
          placeholder="Enter your request"
          defaultValue={task}
          onChange={(evt) => setTask(evt.target.value)}
          disabled={isStarted}
        />
      </div>
      <div className="column is-flex is-full is-justify-content-center">
        <button
          onClick={startAgent}
          className={`button is-primary is-medium ${isStarted && "is-loading"}`}
          disabled={isStarted || !task}
        >
          Start Agent
        </button>
      </div>
    </div>
  );

  if (error?.length && progress?.length === 0) {
    return (
      <main className="container">
        <div className="columns full-height is-vcentered">
          <div className="notification is-danger">{errorDisplay}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="columns full-height is-vcentered">
        {login
          ? loginButton
          : !loading
          ? progress?.length > 0
            ? error
              ? errorDisplay
              : agentDisplay
            : taskInputDisplay
          : "Loading..."}
      </div>
    </main>
  );
}
