export function initializePlaybackHistory({ limit = 100 } = {}) {
    let entries = [];
    let nextEntryID = 1;
    const listeners = new Set();

    function notify() {
        const currentEntries = getEntries();

        listeners.forEach((listener) => {
            listener(currentEntries);
        });
    }

    function add(track) {
        entries.unshift({
            id: nextEntryID++,
            track,
            playedAt: Date.now(),
        });

        if (entries.length > limit) {
            entries.length = limit;
        }

        notify();
    }

    function clear() {
        if (entries.length === 0) {
            return;
        }

        entries = [];
        notify();
    }

    function getEntries() {
        return entries.map((entry) => ({ ...entry }));
    }

    function subscribe(listener) {
        listeners.add(listener);
        listener(getEntries());

        return () => {
            listeners.delete(listener);
        };
    }

    return {
        add,
        clear,
        getEntries,
        subscribe,
    };
}
