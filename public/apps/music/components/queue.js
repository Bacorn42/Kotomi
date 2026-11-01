export function initializeQueue() {
    let entries = [];
    let nextEntryID = 1;
    const listeners = new Set();

    function notify() {
        const currentEntries = getEntries();

        listeners.forEach((listener) => {
            listener(currentEntries);
        });
    }

    function createEntries(tracks) {
        return tracks.map((track) => ({
            id: nextEntryID++,
            track,
        }));
    }

    function replace(tracks) {
        entries = createEntries(tracks);
        notify();
    }

    function append(tracks) {
        if (tracks.length === 0) {
            return;
        }

        entries.push(...createEntries(tracks));
        notify();
    }

    function prepend(tracks) {
        if (tracks.length === 0) {
            return;
        }

        entries.unshift(...createEntries(tracks));
        notify();
    }

    function takeNext() {
        const entry = entries.shift() ?? null;

        if (entry) {
            notify();
        }

        return entry;
    }

    function remove(entryID) {
        const index = entries.findIndex((entry) => entry.id === entryID);

        if (index === -1) {
            return false;
        }

        entries.splice(index, 1);
        notify();

        return true;
    }

    function move(entryID, newIndex) {
        const oldIndex = entries.findIndex((entry) => entry.id === entryID);

        if (
            oldIndex === -1 ||
            newIndex < 0 ||
            newIndex >= entries.length ||
            oldIndex === newIndex
        ) {
            return false;
        }

        const [entry] = entries.splice(oldIndex, 1);
        entries.splice(newIndex, 0, entry);

        notify();

        return true;
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

    function getTracks() {
        return entries.map((entry) => entry.track);
    }

    function subscribe(listener) {
        listeners.add(listener);
        listener(getEntries());

        return () => {
            listeners.delete(listener);
        };
    }

    return {
        replace,
        append,
        prepend,
        takeNext,
        remove,
        move,
        clear,
        getEntries,
        getTracks,
        subscribe,
    };
}
