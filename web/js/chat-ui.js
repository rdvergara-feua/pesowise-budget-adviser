// Chat helpers: bubbles, buttons, popup. No budget logic in here.
// createChat() works on any container, so the chat can live inside a window.

export function createChat(chat) {
  const scroll = () => { chat.scrollTop = chat.scrollHeight; };

  return {
    bubble(text, { user = false, color = "" } = {}) {
      const row = document.createElement("div");
      row.className = "row" + (user ? " user" : "");
      const box = document.createElement("div");
      box.className = "bubble" + (color ? " " + color : "");
      box.textContent = text;
      row.appendChild(box);
      chat.appendChild(row);
      scroll();
    },

    actionButtons(buttons) {
      const bar = document.createElement("div");
      bar.className = "actions";
      for (const { label, color, onClick } of buttons) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-" + color;
        button.textContent = label;
        button.addEventListener("click", onClick);
        bar.appendChild(button);
      }
      chat.appendChild(bar);
      scroll();
    },

    clear() {
      chat.replaceChildren();
    },
  };
}

// ---------- Popup (one shared <dialog> in index.html) ----------
const popup = document.getElementById("popup");

export function showPopup(title, contentNode) {
  document.getElementById("popup-title-text").textContent = title;
  document.getElementById("popup-body").replaceChildren(contentNode);
  if (!popup.open) popup.showModal();
}

document.getElementById("popup-close").addEventListener("click", () => popup.close());
popup.addEventListener("click", (event) => {
  if (event.target === popup) popup.close(); // click on backdrop
});
