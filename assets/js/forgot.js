document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-form");
  const host = window.location.hostname;
  const resetBtn = document.getElementById("reset-btn");
  const msgBox = document.getElementById("reset-message");

  if (host === "localhost" || host === "127.0.0.1") {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("🛠 Dev mode: reset link not actually sent.");
    });
  } else {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Set loading state
      resetBtn.disabled = true;
      resetBtn.textContent = "Sending...";

      try {
        const formData = new FormData(form);
        const response = await fetch("/includes/forgot.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        msgBox.innerText = result.message;
        msgBox.style.color = result.success ? "green" : "red";
      } catch (err) {
        msgBox.innerText = "An unexpected error occurred.";
        msgBox.style.color = "red";
      } finally {
        // Restore button state
        resetBtn.disabled = false;
        resetBtn.textContent = "Send Reset Link";
      }
    });
  }
});
