// Логика лобби: список игр, создание и подключение

function initLobbyPage() {
  const username = localStorage.getItem("username");
  if (!username) {
    window.location.href = "/";
    return;
  }

  const userEl = document.getElementById("user");
  const createBtn = document.getElementById("createGame");
  const gamesList = document.getElementById("games");

  if (userEl) userEl.textContent = "Вы: " + username;

  const socket = io();

  socket.on("connect", () => {
    console.log("Socket подключён:", socket.id);
  });

  if (createBtn) {
    createBtn.addEventListener("click", () => {
      console.log("Нажата кнопка создать игру");
      socket.emit("create_game", { username });
    });
  }

  socket.on("game_created", (gameId) => {
    localStorage.setItem("createdGameId", gameId);
    window.location.href = "game.html?game=" + gameId;
  });

  socket.on("games_list", (games) => {
    if (!gamesList) return;
    gamesList.innerHTML = "";

    games.forEach((gameId) => {
      const li = document.createElement("li");
      li.textContent = gameId;

      const btn = document.createElement("button");
      btn.textContent = "Присоединиться";
      btn.addEventListener("click", () => {
        window.location.href = "game.html?game=" + gameId;
      });

      li.appendChild(btn);
      gamesList.appendChild(li);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLobbyPage);
} else {
  initLobbyPage();
}

