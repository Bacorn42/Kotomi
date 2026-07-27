export async function getStatistics() {
    const response = await fetch("/api/dice/statistics");

    return await response.json();
}
