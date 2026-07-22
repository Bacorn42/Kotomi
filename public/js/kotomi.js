import { AppRegistry } from "./appRegistry.js";
import { renderAppHeader, renderPlatformHeader } from "./appShell.js";

function initializeKotomiApp(appId) {
    const app = AppRegistry.find((x) => x.id === appId);

    if (!app) {
        console.error(`Kotomi app not found: ${appId}`);
        return;
    }

    renderAppHeader({
        title: `${app.icon} ${app.name}`,
        description: app.description,
    });
}

async function getCurrentUser() {
    const response = await fetch("/api/auth/me");
    const data = await response.json();
    return data.user;
}

function formatUsername(username) {
    if (!username) {
        return "";
    }

    return username.charAt(0).toUpperCase() + username.slice(1);
}

export {
    AppRegistry,
    renderAppHeader,
    initializeKotomiApp,
    renderPlatformHeader,
    getCurrentUser,
    formatUsername,
};
