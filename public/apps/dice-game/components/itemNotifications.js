export function showItemDrop(item) {
    const container = document.getElementById("item-notifications");
    const notification = document.createElement("div");
    notification.className = "item-notification";
    notification.innerHTML = `
        <img src="assets/items/${item.icon}">
        <div>
            <strong>${item.name}</strong>
            <p class="item-rarity">${item.rarity}</p>
            <p>Item added to inventory</p>
        </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}
