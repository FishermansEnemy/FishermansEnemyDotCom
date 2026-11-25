(() => {
  const root = document.querySelector('[data-stream-status]');
  if (!root) return;

  const REFRESH_MS = 60_000;
  const TWITCH_CHANNEL = 'https://www.twitch.tv/fishermansenemytv';
  const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/c/fishermansenemy/live';
  const YOUTUBE_CHANNEL_ID = 'UCgesG-XlnAQiLmQqnDokaLA';
  const TWITCH_API = 'https://decapi.me/twitch';
  const LIVE_STATUS_API = `https://theystill.live/twitch/fishermansenemytv,yt:${YOUTUBE_CHANNEL_ID}`;
  const YOUTUBE_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
  const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

  async function fetchJson(url) {
    const response = await fetch(url, {cache: 'no-store'});
    if (!response.ok) throw new Error(`Metadata API returned ${response.status}`);
    return response.json();
  }

  async function fetchText(url) {
    const response = await fetch(url, {cache: 'no-store'});
    if (!response.ok) throw new Error(`Status API returned ${response.status}`);
    return (await response.text()).trim();
  }

  function render(card, {online, title = '', game = '', vodUrl = '', vodTitle = '', avatar = ''}) {
    const service = card.dataset.service;
    const state = card.querySelector('[data-state]');
    const description = card.querySelector('[data-description]');
    const channelLink = card.querySelector('.stream-service-link');
    const avatarLink = card.querySelector('.stream-avatar-link');
    const image = card.querySelector('[data-avatar]') || card.querySelector('.stream-avatar:not([data-placeholder])');
    const placeholder = card.querySelector('[data-placeholder]');
    const channelUrl = service === 'twitch' ? TWITCH_CHANNEL : YOUTUBE_CHANNEL_URL;

    channelLink.href = channelUrl;
    avatarLink.href = channelUrl;
    if (avatar && image) image.src = avatar;
    const hasAvatar = Boolean(image && (avatar || image.getAttribute('src')));
    if (image) image.hidden = !hasAvatar;
    if (placeholder) placeholder.hidden = hasAvatar;
    state.textContent = online ? '[ONLINE]' : '[OFFLINE]';
    state.classList.toggle('is-online', online);
    state.setAttribute('aria-label', online ? 'Online' : 'Offline');

    const descriptionLink = document.createElement('a');
    descriptionLink.href = online ? channelUrl : (vodUrl || channelUrl);
    descriptionLink.textContent = online ? (title || 'Live now') : (vodUrl ? `Latest stream: ${vodTitle || 'Watch VOD'}` : 'No recent stream');
    description.replaceChildren(descriptionLink);
    if (online && game) {
      const gameLabel = document.createElement('span');
      gameLabel.textContent = game;
      description.append(' ', gameLabel);
    }
  }

  async function getStatus() {
    const [liveResponse, youtubeFeed] = await Promise.all([
      fetchJson(LIVE_STATUS_API),
      fetchJson(`${RSS2JSON}${encodeURIComponent(YOUTUBE_FEED)}`).catch(() => null)
    ]);
    if (!Array.isArray(liveResponse.results)) throw new Error('Live status response unavailable');

    const latestYoutube = youtubeFeed?.status === 'ok'
      ? (youtubeFeed.items || []).find((item) => /broadcasted live on twitch|live d&d campaign/i.test(item.description || ''))
      : null;
    const result = {};

    for (const channel of liveResponse.results) {
      if (!channel.found || typeof channel.live !== 'boolean') throw new Error(`${channel.platform} status unavailable`);

      if (channel.platform === 'twitch') {
        const [avatar, title, game] = await Promise.all([
          fetchText(`${TWITCH_API}/avatar/fishermansenemytv`).catch(() => ''),
          channel.live ? fetchText(`${TWITCH_API}/title/fishermansenemytv`).catch(() => channel.title || '') : Promise.resolve(''),
          channel.live ? fetchText(`${TWITCH_API}/game/fishermansenemytv`).catch(() => channel.game || '') : Promise.resolve('')
        ]);
        result.twitch = {online: channel.live, title: title || (channel.live ? 'Live now' : ''), game, avatar};
      }

      if (channel.platform === 'yt') {
        const liveMetadata = channel.live && channel.url
          ? await fetchJson(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(channel.url)}`).catch(() => null)
          : null;
        result.youtube = {
          online: channel.live,
          title: liveMetadata?.title || '',
          vodUrl: latestYoutube?.link || '',
          vodTitle: latestYoutube?.title || ''
        };
      }
    }
    return result;
  }

  const cards = [...root.querySelectorAll('[data-service]')];
  const twitch = cards.find((card) => card.dataset.service === 'twitch');
  const youtube = cards.find((card) => card.dataset.service === 'youtube');
  let refreshing = false;

  const refresh = async () => {
    if (refreshing) return;
    refreshing = true;
    try {
      const status = await getStatus();
      if (twitch && status.twitch) render(twitch, status.twitch);
      if (youtube && status.youtube) render(youtube, status.youtube);
    } catch (error) {
      for (const card of cards) {
        const state = card.querySelector('[data-state]');
        const description = card.querySelector('[data-description]');
        state.textContent = 'UNAVAILABLE';
        state.classList.remove('is-online');
        state.setAttribute('aria-label', 'Status unavailable');
        description.textContent = 'Could not check stream status';
      }
      console.warn('Could not update stream status', error);
    } finally {
      refreshing = false;
    }
  };

  refresh();
  window.setInterval(refresh, REFRESH_MS);
})();
