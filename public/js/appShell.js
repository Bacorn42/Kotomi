function renderAppHeader(options) {
    const target = document.getElementById("app-header");

    target.innerHTML = `
        <header class="kotomi-header">
            <a href="/" class="kotomi-logo">Kotomi</a>
            <div class="kotomi-title">
                <h1>${options.title}</h1>
                <p>${options.description}</p>
            </div>
        </header>
    `;
}

window.renderAppHeader = renderAppHeader;
