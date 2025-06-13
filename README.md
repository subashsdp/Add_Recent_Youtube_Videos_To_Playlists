# 🎥 YouTube Playlist Updater (Apps Script)

Automatically keep your custom YouTube playlists updated with the latest **non-Short videos** from specified channels.

This Google Apps Script connects to the YouTube Data API and:
- Fetches the **latest videos** (excluding Shorts) from defined channels
- Adds any **new videos** (not already present) to a selected playlist

---

## 🚀 Features

- ✅ Auto-sync recent videos from favorite channels
- 🚫 Skips YouTube Shorts (less than 60 seconds)
- 🧠 Avoids duplicate additions
- 🔄 Designed for daily or hourly triggers
- 🔐 Runs entirely on Google Apps Script + YouTube API

---

## 📁 Project Structure

```js
HANDLE_PLAYLIST_MAP = {
  'DESTINATION_PLAYLIST_ID': ['CHANNEL_ID_1', 'CHANNEL_ID_2', ...]
};
