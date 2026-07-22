import { renderPlatformHeader } from "/js/kotomi.js";

renderPlatformHeader("Register", "Create your Kotomi account");

document.getElementById("register").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if (password !== confirm) {
        message.textContent = "Passwords do not match";
        return;
    }

    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    const data = await response.json();

    if (data.success) {
        window.location.href = "/login/";
    } else {
        message.textContent = data.message;
    }
});
