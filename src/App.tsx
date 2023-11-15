import "./App.css";
import "bulma/css/bulma.min.css";
import { useState } from "react";
import { usePolyfire, useAgent, DefinitionAction } from "polyfire-js/hooks";
import { examples } from "./examples";

/**
 * Main App Component
 * Provides functionality to:
 * 1. Login to the system
 * 2. Start an agent with a specified task
 * 3. Show the agent's progress and provide control to stop/restart the agent
 */
export default function App() {
  // Hooks to interact with Polyfact and Agent
  const {
    auth: { login, status },
    models: { generate },
  } = usePolyfire();

  const search = async (request: string) => {
    const page = await generate(request, {
      web: true,
    });

    return page;
  };

  const summarize = async (content: string) => {
    const page = await generate(`summarize this text : ${content}`);

    return page;
  };

  const actions: DefinitionAction[] = [
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
    if (start) {
      const getResponse = async () => {
        try {
          setIsStarted(true);

          await start(task, (step: string, res: string) => {
            setProgress((prev: { step: string; res: string }[]) => [
              ...prev,
              { step, res },
            ]);
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
    if (stop) {
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
    <button onClick={() => login({ provider: "github" })} className="login-btn">
      Login with Github
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

  if (status === "loading") {
    return <div>"Loading..."</div>;
  }

  if (status === "unauthenticated") {
    return (
      <main className="container">
        <div className="columns full-height is-vcentered">{loginButton}</div>
      </main>
    );
  }

  if (status === "authenticated") {
    // Render the main UI when authenticated
    return (
      <main className="container">
        <div className="columns full-height is-vcentered">
          {progress?.length > 0
            ? error
              ? errorDisplay
              : agentDisplay
            : taskInputDisplay}
        </div>
      </main>
    );
  }

  return null; // Return null for any other status
}
