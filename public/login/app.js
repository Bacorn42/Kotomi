import { renderPlatformHeader } from "/js/kotomi.js";

renderPlatformHeader("Login", "Sign in to Kotomi");

const button = document.getElementById("login");

button.addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/auth/login", {
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
    const message = document.getElementById("message");

    if (data.success) {
        window.location.href = "/";
    } else {
        message.textContent = data.message;
    }
});
