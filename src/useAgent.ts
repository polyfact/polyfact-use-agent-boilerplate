import { useState } from "react";
import { usePolyfact } from "polyfact/hooks";
import { t } from "polyfact";

const ActionAgent = t.type({
  thought: t.string.description(
    "Provide your reasoning or thought process about the action you plan to undertake from ACTION_LIST to address the user's question and from the last Observation. For example: 'To find out the capital of France, I should search for it.'"
  ),
  action: t.type({
    type: t.string.description(
      "Add here the appropriate action from ACTION_LIST. For instance: 'Search'. If you believe you've found the answer, use the 'Finish' action to conclude the response to the question."
    ),
    arg: t.string.description(
      "Specify the parameter or key detail for the chosen action that helps in answering the question. For instance: 'France' when trying to find its capital."
    ),
  }),
});

type TActionAgent = t.TypeOf<typeof ActionAgent>;

export type Options = {
  provider?: "openai" | "cohere" | "llama" | "";
  model?: string;
  stop?: string[];
  temperature?: number;
  infos?: boolean;
};

type Agent = {
  start: (
    question: string,
    progress?: (step: string, result: string) => void
  ) => Promise<string | null>;
  stop: () => void;
  error?: string;
  loading?: boolean;
};

export type TDefinitionAction = {
  name: string;
  callback: (arg: string) => Promise<string | undefined>;
  description: string;
  example: {
    question: string;
    process: {
      thought: string;
      action: string;
      observation: string;
    }[];
  };
};

function formatAllExamples(actions: TDefinitionAction[]): string {
  const formatExample = (examples: TDefinitionAction["example"]): string => {
    const formattedExamples = examples.process
      .map(
        (p) => `
            Thought: ${p.thought}
            Action: ${p.action}
            Observation: ${p.observation}
          `
      )
      .join("\n");

    return `
            Question: ${examples.question}
            ${formattedExamples}
          `;
  };

  return actions.map((action) => formatExample(action.example)).join("\n");
}

const useAgent = (
  actions: TDefinitionAction[],
  options: Options = { provider: "openai", model: "gpt-3.5-turbo" }
): Agent => {
  const { polyfact, polyfactPromise } = usePolyfact(null);

  const [isRunning, setIsRunning] = useState(true);

  const stop = () => {
    console.info("Stopping...");
    setIsRunning(false);
  };

  const executeAction = async (res: TActionAgent): Promise<string> => {
    console.info("Executing action...");

    let observation = "No Action found";

    const action = actions.find((action) => action.name === res.action.type);

    try {
      observation = (await action?.callback(res.action.arg)) as string;
    } catch (e) {
      console.error(e);
      observation = "Error while executing action";
    }

    return observation;
  };

  const start = async (
    question: string,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    progress: (step: string, result: string) => void = () => {}
  ): Promise<string | null> => {
    await polyfactPromise;
    console.info("Starting...");
    let history = `
        ====
        Example: ${formatAllExamples(actions)}
        ====
        Here is the ACTION_LIST that you can use to help you to answer the question:
        ${actions
          .map((action) => `${action.name} // ${action.description}`)
          .join("\n")}
        Finish // If you believe you've found that the last observation answered to the question.

        Initial Question: ${question}
        `;

    let loop = 0;
    let lastObservation = "";

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = await polyfact?.generateWithType(
        history,
        ActionAgent,
        options
      );

      if (!ActionAgent.is(result)) {
        throw new Error("Expected ActionAgent");
      }

      progress("Thought", result?.thought as string);

      if (!result?.action.type) {
        throw new Error("Expected action");
      }

      if (result.action.type === "Finish" || loop === 4 || !isRunning) {
        progress("finish", lastObservation);
        stop();
        return lastObservation;
      }

      lastObservation = await executeAction(result);

      progress("Observation", lastObservation);

      history += `\nThought:${result.thought}\nAction:${result.action.type}[${result.action.arg}]\nObservation: ${lastObservation}`;

      loop++;
    }
  };
  return { start, stop };
};

export default useAgent;
