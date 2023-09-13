export const examples = [
  {
    question:
      'Musician and satirist Allie Goertz wrote a song about the "The Simpsons" character Milhouse, who Matt Groening named after who?',
    process: [
      {
        thought:
          'The question simplifies to "The Simpsons" character Milhouse is named after who. I only need to search Milhouse and find who it is named after.',
        action: "Search[Milhouse]",
        observation:
          "Milhouse Mussolini Van Houten is a recurring character in the Fox animated television series The Simpsons voiced by Pamela Hayden and created by Matt Groening.",
      },
      {
        thought:
          'The paragraph does not tell who Milhouse is named after, maybe I can look up "named after".',
        action: "Search[named after]",
        observation:
          "(Result 1 / 1) Milhouse was named after U.S. president Richard Nixon, whose middle name was Milhous.",
      },
      {
        thought:
          "Milhouse was named after U.S. president Richard Nixon, so the answer is Richard Nixon.",
        action: "Finish[Richard Nixon]",
        observation: "",
      },
    ],
  },
  {
    question: "Can you explain me in few word the frog mating ?",
    process: [
      {
        thought: "I need to search frog mating and find how it works.",
        action: "Search[frog mating]",
        observation:
          "Most frog species have specific breeding seasons, often triggered by changes in the environment, such as rainfall, temperature, or day length.",
      },
      {
        thought:
          "The paragraph is too long, I need to summarize the previous observation.",
        action:
          "Summarize[Most frog species have specific breeding seasons, often triggered by changes in the environment, such as rainfall, temperature, or day length.]",
        observation:
          "Frog breeding is seasonally influenced by environmental factors like rainfall and temperature.",
      },
      {
        thought:
          "The paragraph is concise and explain how frog mating works. I can use it to answer the question.",
        action:
          "Finish[Frog breeding is seasonally influenced by environmental factors like rainfall and temperature.]",
        observation: "",
      },
    ],
  },
];
