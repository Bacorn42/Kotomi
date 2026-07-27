import { formatUsername } from "/js/kotomi.js";
import { formatMoney } from "../utils/formatters.js";

const FEED_DELAY_MS = 1000;
const MAX_FEED_ITEMS = 20;

const feedQueue = [];
let feedProcessing = false;

export function initializeLiveFeed(socket) {
    socket.on("dice-feed", (event) => {
        addFeedEvent(event);
    });
}

function addFeedEvent(event) {
    feedQueue.push(event);
    processFeedQueue();
}

async function processFeedQueue() {
    if (feedProcessing) {
        return;
    }

    feedProcessing = true;

    while (feedQueue.length > 0) {
        const event = feedQueue.shift();
        await sleep(FEED_DELAY_MS);
        displayFeedEvent(event);
    }

    feedProcessing = false;
}

function displayFeedEvent(event) {
    const html = formatFeedEvent(event);

    if (!html) {
        return;
    }

    const feed = document.getElementById("live-feed");

    if (!feed) {
        return;
    }

    const item = document.createElement("div");
    item.className = "feed-event";
    item.innerHTML = html;

    feed.prepend(item);

    while (feed.children.length > MAX_FEED_ITEMS) {
        feed.removeChild(feed.lastChild);
    }
}

function formatFeedEvent(event) {
    switch (event.type) {
        case "ROLL":
            return `
                <div>
                    <span>🎲</span>
                    <strong>${formatUsername(event.username)}</strong>
                    rolled 
                    <strong>${event.score}</strong>
                    points
                    ${
                        event.moneyCents > 0
                            ? `<span>(+${formatMoney(event.moneyCents)})</span>`
                            : ""
                    }
                </div>
            `;

        case "ITEM":
            return `
                <div>
                    <span>✨</span>
                    <strong>${formatUsername(event.username)}</strong>
                    found
                    <strong class="${event.item.rarity.toLowerCase()}">
                        ${event.item.name}
                    </strong>
                </div>
            `;

        case "ACHIEVEMENT":
            return `
                <div>
                    <span>🏆</span>
                    <strong>${formatUsername(event.username)}</strong>
                    unlocked
                    <strong>${event.achievement.Name}</strong>
                </div>
            `;

        default:
            return "";
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
