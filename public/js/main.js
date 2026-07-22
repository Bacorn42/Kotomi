function createAppCard(app) {
    return `
        <article class="kotomi-card app-card">
            <h3>${app.icon} ${app.name}</h3>
            <p>${app.description}</p>
            <a class="kotomi-button" href="${app.url}">Open</a>
        </article>
    `;
}

function groupAppsByCategory(apps) {
    const groups = {};

    for (const app of apps) {
        if (!groups[app.category]) {
            groups[app.category] = [];
        }
        groups[app.category].push(app);
    }

    return groups;
}

function renderApps() {
    const container = document.getElementById("app-container");
    const groups = groupAppsByCategory(AppRegistry);

    let html = "";

    for (const [category, apps] of Object.entries(groups)) {
        html += `
            <section class="app-category">
                <h2>${category}</h2>
                <div class="app-grid">
                    ${apps.map(createAppCard).join("")}
                </div>
            </section>
        `;
    }

    container.innerHTML = html;
}

renderApps();
