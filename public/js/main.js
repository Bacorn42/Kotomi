function createAppCard(app) {
    return `
        <article class="kotomi-card app-card">
            <h3>${app.icon} ${app.name}</h3>
            <p>${app.description}</p>
            <a class="kotomi-button" href="${app.url}">Open</a>
        </article>
    `;
}

function renderApps() {
    const container = document.getElementById("app-container");

    container.innerHTML = `
        <section class="app-grid">
            ${AppRegistry.map(createAppCard).join("")}
        </section>
    `;
}

renderApps();
