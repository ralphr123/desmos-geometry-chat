import { talkToGpt } from "./lib/talkToGpt.js";

const EMPTY_STATE = {
  version: 11,
  randomSeed: "2aa02c57d2d7a27ecf0c55080187f03f",
  graph: {
    viewport: {
      xmin: -7,
      ymin: -7,
      xmax: 7,
      ymax: 7,
    },
    xAxisMinorSubdivisions: 1,
    yAxisMinorSubdivisions: 1,
    degreeMode: true,
    product: "geometry-calculator",
  },
  expressions: {
    list: [
      {
        type: "folder",
        id: "**dcg_geo_folder**",
        title: "geometry",
        secret: true,
      },
      { type: "expression", id: "1", color: "#c74440" },
    ],
  },
};

(() => {
  const elt = document.getElementById("geometry");
  const state = getStorage("desmos-geo-state");
  const chatEntries = getStorage("desmos-chat-entries");
  const geometry = Desmos.Geometry(elt);

  geometry.setState(state || EMPTY_STATE);

  if (chatEntries) {
    localStorage.removeItem("desmos-chat-entries");

    for (const entry of chatEntries) {
      insertChatEntry(entry);
    }
  }

  geometry.observeEvent("change", () => {
    const state = geometry.getState();
    setStorage("desmos-geo-state", state);
  });

  const $btnChat = document.getElementById("btn-chat");
  const $chatWindow = document.getElementById("chat-window");
  const $btnSend = document.getElementById("btn-chat-send");
  const $inputChat = document.getElementById("input-chat");

  $btnChat.addEventListener("click", () => {
    const { display } = $chatWindow.style;

    if (display === "flex") {
      $chatWindow.style.display = "none";
    } else {
      $chatWindow.style.display = "flex";
    }
  });
  $btnSend.addEventListener("click", onSendChat);
  $inputChat.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      onSendChat();
    }
  });

  async function onSendChat() {
    const prompt = $inputChat.value;

    if (!prompt) {
      return;
    }

    $btnSend.classList.add("disabled");
    $inputChat.setAttribute("disabled", "true");

    const state = JSON.parse(JSON.stringify(geometry.getState()));
    const expressions = [...state.expressions.list];

    state.expressions.list = [];

    const gptState = expressions
      .filter((expression) => {
        if (expression.id === "**dcg_geo_folder**") {
          return false;
        }

        if (expression.folderId !== "**dcg_geo_folder**") {
          state.expressions.list.push(expression);
          return false;
        }

        return true;
      })
      .map(({ latex }) => latex);

    const result = await talkToGpt({ state: gptState, prompt });

    state.expressions.list = [
      {
        type: "folder",
        id: "**dcg_geo_folder**",
        title: "geometry",
        secret: true,
      },
      ...result.map((latex, i) => {
        let color = "#6042a6";

        if (latex.includes("operatorname{segment}")) {
          color = "#2d70b3";
        }

        if (latex.includes("operatorname{circle}")) {
          color = "#388c46";
        }

        if (latex.includes("operatorname{angle}")) {
          color = "#000000";
        }

        if (latex.includes("operatorname{polygon}")) {
          color = "#2d70b3";
        }

        return {
          type: "expression",
          id: `${Math.random()}-${i}`,
          folderId: "**dcg_geo_folder**",
          latex,
          color,
        };
      }),
      // Non geometric state preserved
      ...state.expressions.list,
    ];

    $inputChat.value = "";
    geometry.setState(state);
    insertChatEntry({ prompt, state });
    $btnSend.classList.remove("disabled");
    $inputChat.removeAttribute("disabled");
  }

  /**
   *
   * @param {{ prompt: string; state: string }} param
   */
  function insertChatEntry({ prompt, state }) {
    const chatEntries = getStorage("desmos-chat-entries") || [];
    const $chatEntriesWrapper = document.getElementById("chat-content");
    let html = "";

    chatEntries.push({ prompt, state });
    setStorage("desmos-chat-entries", chatEntries);
    html += /*html*/ `
      <div 
        class="chat-content-entry" 
        data-state='${JSON.stringify(state)}'
      >
        ${prompt}
      </div>
    `;

    $chatEntriesWrapper.innerHTML += html;

    const $chatEntries = document.getElementsByClassName("chat-content-entry");
    for (const $entry of $chatEntries) {
      $entry.addEventListener("click", () => {
        const state = $entry.getAttribute("data-state");
        geometry.setState(state ? JSON.parse(state) : EMPTY_STATE);
      });
    }
  }

  /**
   *
   * @param {string} key
   * @returns Parsed object
   */
  function getStorage(key) {
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : null;
  }

  /**
   *
   * @param {string} key
   * @param {any} value
   * @returns Parsed object
   */
  function setStorage(key, value) {
    return localStorage.setItem(key, JSON.stringify(value || []));
  }
})();
