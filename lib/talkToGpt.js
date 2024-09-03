const OPENAI_KEY = "";
const SYSTEM_PROMPT = `
  In every message, you will receive two things:

  - A current state, which is a JSON array of command strings
  - A prompt, which will ask you to add to, delete from, or modify the current state

  Each command string is one of 3 things: a graph expression, a geometry operation, or a geometry point. Below are the formats:

  - **Graph expression**: Math in latex format. Could be a coordinate (ex. \`\\left(0,3\\right)\`) or just an expression (ex. \`y=3x+2\`).
  - **Point**: \`\\token{<id>}=\\left(<x>,<y>\\right)\`
  - **Operation**:
      - **Segment**: \`\\token{<id>}=\\operatorname{segment}\\left(\\token{<point1_id>},\\token{<point2_id>}\\right)\`
      - **Circle**: \`\\token{6}=\\operatorname{circle}\\left(\\token{<center_id>},\\token{<edge_id>}\\right)\`
      - **Angle**: \`\\token{3}=\\operatorname{angle}\\left(\\token{point1_id},\\token{anchor_id},\\token{point2_id}\\right)\`
      - **Polygon**: \`\\token{8}=\\operatorname{polygon}\\left(\\token{point1_id},...,\\token{pointn_id}\\right)\`

  Only return the JSON output, nothing else. JSON does not support comments, so no comments.
`;
const MULTISHOT_PROMPT = [
  {
    role: "user",
    content: String.raw`
      <state>[]</state>
      <prompt>Create a polygon with points (0, 2), (2, 0), (0, -2), and (-2, 0)</prompt>
    `,
  },
  {
    role: "assistant",
    content: String.raw`
      [
        "\\token{10}=\\left(0,2\\right)",
        "\\token{11}=\\left(2,0\\right)",
        "\\token{12}=\\left(0,-2\\right)",
        "\\token{9}=\\left(-2,0\\right)",
      ]
    `,
  },
  {
    role: "user",
    content: String.raw`
      <state>[
        "\token{10}=\left(0,2\right)",
        "\token{11}=\left(2,0\right)",
        "\token{12}=\left(0,-2\right)",
        "\token{9}=\left(-2,0\right)"
      ]</state>
      <prompt>Add an angle to all corners in the polygon</prompt>
    `,
  },
  {
    role: "assistant",
    content: String.raw`
      [
        "\\token{10}=\\left(0,2\\right)",
        "\\token{11}=\\left(2,0\\right)",
        "\\token{12}=\\left(0,-2\\right)",
        "\\token{9}=\\left(-2,0\\right)",
        "\\token{36}=\\operatorname{angle}\\left(\\token{10},\\token{9},\\token{12}\\right)",
        "\\token{42}=\\operatorname{angle}\\left(\\token{9},\\token{12},\\token{11}\\right)",
        "\\token{57}=\\operatorname{angle}\\left(\\token{9},\\token{10},\\token{11}\\right)",
        "\\token{70}=\\operatorname{angle}\\left(\\token{10},\\token{11},\\token{12}\\right)"
      ]
    `,
  },
  {
    role: "user",
    content: String.raw`
      <state>[]</state>
      <prompt>Create a line from (-2, 2) to (2, -2)</prompt>
    `,
  },
  {
    role: "assistant",
    content: String.raw`
      [
        "\\token{1}=\\left(-2,2\\right)",
        "\\token{2}=\\left(2,-2\\right)",
        "\\token{3}=\\operatorname{segment}\\left(\\token{1},\\token{2}\\right)"
      ]
    `,
  },
  {
    role: "user",
    content: String.raw`
      <state>[
        "\token{1}=\left(-2,2\right)",
        "\token{2}=\left(2,-2\right)",
        "\token{3}=\operatorname{segment}\left(\token{1},\token{2}\right)"
      ]</state>
      <prompt>Now add a third point anywhere along the x axis, add a line between it and (2, -2), and add an angle that the two segments make.</prompt>
    `,
  },
  {
    role: "assistant",
    content: String.raw`
      [
        "\\token{1}=\\left(-2,2\\right)",
        "\\token{2}=\\left(2,-2\\right)",
        "\\token{3}=\\operatorname{segment}\\left(\\token{1},\\token{2}\\right)",
        "\\token{4}=\\left(1,0\\right)",
        "\\token{5}=\\operatorname{segment}\\left(\\token{4},\\token{2}\\right)",
        "\\token{6}=\\operatorname{angle}\\left(\\token{1},\\token{2},\\token{4}\\right)"
      ]
    `,
  },
];

/**
 *
 * @param {{ prompt: string; state: string[] }} content
 * @returns {Promise<string[]>} List of Desmos expression latex values
 */
export async function talkToGpt({ prompt, state }) {
  try {
    if (!OPENAI_KEY) {
      console.error(
        "No OpenAI key provided in talkToGpt.js. If you want one of my keys to test with let me know!"
      );
      return [];
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...MULTISHOT_PROMPT,
          {
            role: "user",
            // prettier-ignore
            content: `<state>${JSON.stringify(state)}</state><prompt>${prompt}</prompt>`,
          },
        ],
      }),
    });

    if (!resp.ok) {
      return [];
    }

    const data = await resp.json();

    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.error("Erorr talking to GPT:", e);
  }
}
