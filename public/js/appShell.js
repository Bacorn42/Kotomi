import { getCurrentUser, formatUsername } from "./kotomi.js";

async function renderAppHeader(options) {
    const target = document.getElementById("app-header");
    const user = await getCurrentUser();

    let accountHtml;
    if (user) {
        accountHtml = `
            <span>Welcome, ${formatUsername(user.Username)}</span>
            <button id="logout" class="kotomi-button kotomi-button-secondary">Logout</button>
        `;
    } else {
        accountHtml = `
            <a class="kotomi-link" href="/login/">Login</a>
            <a class="kotomi-link" href="/register/">Register</a>
        `;
    }

    target.innerHTML = `
        <header class="kotomi-header">
            <a href="/" class="kotomi-logo">Kotomi</a>
            <div class="kotomi-title">
                <h1>${options.title}</h1>
                <p>${options.description}</p>
            </div>
            <div class="kotomi-account">
                ${accountHtml}
            </div>
        </header>
    `;

    const logout = document.getElementById("logout");
    if (logout) {
        logout.addEventListener("click", async () => {
            await fetch("/api/auth/logout", {
                method: "POST",
            });

            window.location.reload();
        });
    }
}

function renderPlatformHeader(title, description) {
    renderAppHeader({
        title,
        description,
    });
}

export { renderAppHeader, renderPlatformHeader };
