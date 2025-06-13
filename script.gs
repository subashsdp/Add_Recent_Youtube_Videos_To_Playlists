// ========= CONFIGURATION =========
const HANDLE_PLAYLIST_MAP = {
  'PLFAU9Lcucoh4yu7sGY8W***************': ['UCRySNNVhiuLW**********','UC7fQFl37yAOa************'] // 'playlistId':['channelId1','channelId2']
};


// ========= MAIN FUNCTION =========
function addRecentVideosToPlaylists() {
  for (const [playlistId, channelIds] of Object.entries(HANDLE_PLAYLIST_MAP)) {
    channelIds.forEach(channelId => {
      const uploadsPlaylistId = getUploadsPlaylistId(channelId);
      if (!uploadsPlaylistId) {
        Logger.log(`❌ No uploads playlist found for channel: ${channelId}`);
        return;
      }

      const recentVideos = getRecentVideosFromPlaylist(uploadsPlaylistId, 5);
      const existingVideoIds = getVideoIdsInPlaylist(playlistId);

      Logger.log(`🔍 Checking channel ${channelId} (Recent 5 videos) → Playlist: ${playlistId}`);

      recentVideos.forEach(video => {
        if (!isShort(video.videoId)) {
          if (!existingVideoIds.includes(video.videoId)) {
            addToPlaylist(playlistId, video.videoId);
            Logger.log(`✅ Added: "${video.title}" → Playlist ${playlistId}`);
          } else {
            Logger.log(`🔁 Already exists: "${video.title}"`);
          }
        } else {
          Logger.log(`⏭️ Skipped Short: "${video.title}"`);
        }
      });
    });
  }
}

// ========= GET UPLOADS PLAYLIST =========
function getUploadsPlaylistId(channelId) {
  const response = YouTube.Channels.list('contentDetails', {
    id: channelId
  });

  if (!response.items || response.items.length === 0) return null;
  return response.items[0].contentDetails.relatedPlaylists.uploads;
}

// ========= GET RECENT VIDEOS FROM PLAYLIST =========
function getRecentVideosFromPlaylist(playlistId, limit = 5) {
  const response = YouTube.PlaylistItems.list('snippet', {
    playlistId: playlistId,
    maxResults: limit
  });

  if (!response.items) return [];

  return response.items.map(item => ({
    title: item.snippet.title,
    videoId: item.snippet.resourceId.videoId
  }));
}

// ========= GET EXISTING VIDEO IDs IN TARGET PLAYLIST =========
function getVideoIdsInPlaylist(playlistId) {
  let videoIds = [];
  let nextPageToken = null;

  do {
    const response = YouTube.PlaylistItems.list('snippet', {
      playlistId: playlistId,
      maxResults: 50,
      pageToken: nextPageToken
    });

    if (!response.items) break;

    videoIds = videoIds.concat(response.items.map(item => item.snippet.resourceId.videoId));
    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return videoIds;
}

// ========= CHECK IF VIDEO IS A SHORT =========
function isShort(videoId) {
  const videoDetails = YouTube.Videos.list('contentDetails', {
    id: videoId
  });

  if (!videoDetails.items || videoDetails.items.length === 0) return false;

  const duration = videoDetails.items[0].contentDetails.duration; // ISO 8601 format
  const secondsMatch = duration.match(/PT(\d+)S$/);             // e.g., PT45S
  const minutesMatch = duration.match(/PT(\d+)M(\d+)?S?/);       // e.g., PT1M30S

  if (secondsMatch && parseInt(secondsMatch[1]) < (60*3)) return true;
  if (minutesMatch && parseInt(minutesMatch[1]) < 3) return true;

  return false;
}

// ========= ADD VIDEO TO PLAYLIST =========
function addToPlaylist(playlistId, videoId) {
  try {
    YouTube.PlaylistItems.insert({
      snippet: {
        playlistId: playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId: videoId
        }
      }
    }, 'snippet');
  } catch (e) {
    Logger.log(`❌ Failed to add video: ${videoId} → ${e.message}`);
  }
}