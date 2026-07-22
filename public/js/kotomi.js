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

window.initializeKotomiApp = initializeKotomiApp;
