/**
 * Cloud Service for leaderboard and cloud saves
 * Handles communication with backend API
 */

const API_BASE = 'http://localhost:8000/api';
const API_KEY = 'pixel-survivor-2024-secret';

/**
 * Generate or get player ID
 */
export function getPlayerId() {
  let playerId = localStorage.getItem('pixel_player_id');
  if (!playerId) {
    playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('pixel_player_id', playerId);
  }
  return playerId;
}

/**
 * Get player name
 */
export function getPlayerName() {
  let playerName = localStorage.getItem('pixel_player_name');
  if (!playerName) {
    playerName = 'Player' + Math.floor(Math.random() * 10000);
    localStorage.setItem('pixel_player_name', playerName);
  }
  return playerName;
}

/**
 * Set player name
 */
export function setPlayerName(name) {
  localStorage.setItem('pixel_player_name', name);
}

/**
 * Submit score to leaderboard
 */
export async function submitScore(scoreData) {
  try {
    const response = await fetch(`${API_BASE}/scores/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        player_id: getPlayerId(),
        player_name: getPlayerName(),
        ...scoreData,
        achieved_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit score');
    }

    return await response.json();
  } catch (error) {
    console.error('Submit score error:', error);
    throw error;
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(mode = 'endless', levelIndex = 0, limit = 100, offset = 0) {
  try {
    const params = new URLSearchParams({
      mode,
      level_index: levelIndex.toString(),
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`${API_BASE}/scores/leaderboard?${params}`);
    if (!response.ok) {
      throw new Error('Failed to get leaderboard');
    }

    return await response.json();
  } catch (error) {
    console.error('Get leaderboard error:', error);
    throw error;
  }
}

/**
 * Get player's best scores
 */
export async function getPlayerScores() {
  try {
    const response = await fetch(`${API_BASE}/scores/player/${getPlayerId()}`);
    if (!response.ok) {
      throw new Error('Failed to get player scores');
    }

    return await response.json();
  } catch (error) {
    console.error('Get player scores error:', error);
    throw error;
  }
}

/**
 * Get player's rank
 */
export async function getPlayerRank(mode = 'endless', levelIndex = 0) {
  try {
    const params = new URLSearchParams({
      mode,
      level_index: levelIndex.toString(),
    });

    const response = await fetch(`${API_BASE}/scores/rank/${getPlayerId()}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to get player rank');
    }

    return await response.json();
  } catch (error) {
    console.error('Get player rank error:', error);
    throw error;
  }
}

/**
 * Save game data to cloud
 */
export async function saveToCloud(data) {
  try {
    const dataStr = JSON.stringify(data, Object.keys(data).sort());
    const checksum = await computeChecksum(dataStr);

    const response = await fetch(`${API_BASE}/saves/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        player_id: getPlayerId(),
        data,
        checksum,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save to cloud');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloud save error:', error);
    throw error;
  }
}

/**
 * Load game data from cloud
 */
export async function loadFromCloud() {
  try {
    const response = await fetch(`${API_BASE}/saves/load/${getPlayerId()}`);
    if (!response.ok) {
      throw new Error('Failed to load from cloud');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloud load error:', error);
    throw error;
  }
}

/**
 * Delete cloud save
 */
export async function deleteCloudSave() {
  try {
    const response = await fetch(`${API_BASE}/saves/delete/${getPlayerId()}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete cloud save');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete cloud save error:', error);
    throw error;
  }
}

/**
 * Compute MD5 checksum
 */
async function computeChecksum(dataStr) {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataStr);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check health of backend service
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  getPlayerId,
  getPlayerName,
  setPlayerName,
  submitScore,
  getLeaderboard,
  getPlayerScores,
  getPlayerRank,
  saveToCloud,
  loadFromCloud,
  deleteCloudSave,
  checkBackendHealth,
};
