// Логика стартового экрана (ввод ника)

function initIndexPage() {
  const loginBtn = document.getElementById("loginBtn");
  const usernameInput = document.getElementById("username");

  if (!loginBtn || !usernameInput) return;

  loginBtn.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("Введите ник");

    localStorage.setItem("username", name);
    window.location.href = "lobby.html";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initIndexPage);
} else {
  initIndexPage();
}

