import { AppRegistry } from "./appRegistry.js";
import { renderAppHeader } from "./appShell.js";

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

function renderPlatformHeader(title, description) {
    renderAppHeader({
        title,
        description,
    });
}

export { AppRegistry, renderAppHeader, initializeKotomiApp, renderPlatformHeader };
