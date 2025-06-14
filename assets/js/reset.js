document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const form = document.getElementById("reset-form");
  const tokenInput = document.getElementById("reset-token");
  const msgBox = document.getElementById("reset-message");

  if (!token) {
    msgBox.innerText = "Missing or invalid reset token.";
    msgBox.style.color = "red";
    form.style.display = "none";
    return;
  }

  tokenInput.value = token;

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("🛠 Dev mode: password not actually updated.");
    });
  } else {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const response = await fetch("/includes/reset.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      msgBox.innerText = result.message;
      msgBox.style.color = result.success ? "green" : "red";

      if (result.success) {
        msgBox.innerText = "✅ Password updated! Redirecting to login...";
        msgBox.style.color = "green";
        form.style.display = "none";

        setTimeout(() => {
          if (window.top.frames && window.top.frames["main"]) {
            // Site is loaded within a frameset — redirect only the iframe
            window.top.frames["main"].location.href = "/pages/login.htm";
          } else {
            // Not in a frameset — full page redirect
            window.location.href = "/index.htm"; // or wherever your homepage lives
          }
        }, 3000);
      }
    });
  }
});
