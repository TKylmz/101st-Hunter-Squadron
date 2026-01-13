// =====================================================
// SERVER STATUS - Fetches and displays DCS server info
// =====================================================

// Configuration - Update this with Onur's server details
const SERVER_CONFIG = {
    // The endpoint URL via Cloudflare Tunnel (HTTPS)
    apiUrl: 'https://oaks-hardly-charity-beverly.trycloudflare.com/status',

    // Refresh interval in milliseconds
    refreshInterval: 30000, // 30 seconds

    // Demo mode - set to false for real API
    demoMode: false
};

// Demo data for testing (will show when demoMode is true)
const DEMO_DATA = {
    online: true,
    serverName: '101st Hunter Squadron',
    mission: 'Operation Hunter Strike',
    map: 'Caucasus',
    players: 8,
    maxPlayers: 32,
    missionTime: '14:32',
    playerList: ['Onur', 'TK', 'Viper', 'Ghost', 'Maverick', 'Iceman', 'Phoenix', 'Rooster']
};

// Update the UI with server data
function updateServerStatus(data) {
    const indicator = document.getElementById('serverIndicator');
    const statusText = document.getElementById('serverStatusText');
    const missionEl = document.getElementById('serverMission');
    const mapEl = document.getElementById('serverMap');
    const playersEl = document.getElementById('serverPlayers');
    const timeEl = document.getElementById('serverTime');
    const playerListContainer = document.getElementById('playerListContainer');
    const playerList = document.getElementById('playerList');

    if (!indicator) return; // Section not on page

    if (data.online) {
        indicator.className = 'status-indicator online';
        statusText.textContent = getCurrentLanguage() === 'tr' ? 'Çevrimiçi' : 'Online';

        missionEl.textContent = data.mission || '--';
        mapEl.textContent = data.map || '--';
        playersEl.textContent = `${data.players || 0}/${data.maxPlayers || 32}`;
        timeEl.textContent = data.missionTime || '--:--';

        // Show player list if we have players
        if (data.playerList && data.playerList.length > 0) {
            playerListContainer.style.display = 'block';
            playerList.innerHTML = data.playerList
                .map(name => `<span class="player-item">${name}</span>`)
                .join('');
        } else {
            playerListContainer.style.display = 'none';
        }
    } else {
        indicator.className = 'status-indicator offline';
        statusText.textContent = getCurrentLanguage() === 'tr' ? 'Çevrimdışı' : 'Offline';
        missionEl.textContent = getCurrentLanguage() === 'tr' ? 'Sunucu şu anda kapalı' : 'Server is currently offline';
        mapEl.textContent = '--';
        playersEl.textContent = '0';
        timeEl.textContent = '--:--';
        playerListContainer.style.display = 'none';
    }
}

// Fetch server status from API
async function fetchServerStatus() {
    if (SERVER_CONFIG.demoMode) {
        // Use demo data for testing
        updateServerStatus(DEMO_DATA);
        return;
    }

    if (!SERVER_CONFIG.apiUrl) {
        updateServerStatus({ online: false });
        return;
    }

    try {
        const response = await fetch(SERVER_CONFIG.apiUrl, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) throw new Error('Server not responding');

        const data = await response.json();
        updateServerStatus({
            online: data.online !== false, // Use API's online status
            serverName: data.serverName || data.name || '101st Hunter Squadron',
            mission: data.mission || data.mission_name || '--',
            map: data.map || data.theatre || '--',
            players: data.players || data.player_count || 0,
            maxPlayers: data.maxPlayers || data.max_players || 32,
            missionTime: data.missionTime || data.mission_time || data.time || '--:--',
            playerList: data.playerList || data.player_list || data.players_list || []
        });
    } catch (error) {
        console.log('Server status fetch failed:', error);
        updateServerStatus({ online: false });
    }
}

// Initialize server status
function initServerStatus() {
    // Initial fetch
    fetchServerStatus();

    // Set up periodic refresh
    setInterval(fetchServerStatus, SERVER_CONFIG.refreshInterval);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServerStatus);
} else {
    initServerStatus();
}
