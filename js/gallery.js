/**
 * GALLERY AUTO-LOADER
 * ---------------------------------------------------------------------
 * GitHub Pages is static hosting — there is no server that can list a
 * folder for us. This file gets around that in two steps:
 *
 *   1. Ask the GitHub REST API what's inside assets/images and
 *      assets/videos in THIS repo. That works from any static page,
 *      because it's just a fetch() to api.github.com.
 *   2. If that fails (offline, rate-limited, repo made private, etc.)
 *      fall back to data/manifest.json, a plain list of filenames you
 *      keep up to date — see scripts/generate-manifest.js to build it
 *      automatically with one command before you deploy.
 *
 * Edit REPO_OWNER / REPO_NAME / REPO_BRANCH below to match your repo.
 * ---------------------------------------------------------------------
 */
(function () {
  const CONFIG = {
    owner: 'ZafarPortfolio',
    repo: 'zafarportfolio.github.io',
    branch: 'main',
    imagesPath: 'assets/images',
    videosPath: 'assets/videos',
    imageExts: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'],
    videoExts: ['mp4', 'webm', 'mov'],
  };

  const imageGrid = document.getElementById('image-grid');
  const videoGrid = document.getElementById('video-grid');
  if (!imageGrid && !videoGrid) return; // not on the gallery page

  const extOf = (name) => (name.split('.').pop() || '').toLowerCase();
  const titleize = (name) =>
    name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

  async function fetchFromGitHubAPI(path) {
    const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Unexpected GitHub API response');
    return data
      .filter(f => f.type === 'file')
      .map(f => ({ name: f.name, url: f.download_url }));
  }

  async function fetchFromManifest(kind) {
    const res = await fetch('data/manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest.json not found');
    const data = await res.json();
    const list = data[kind] || [];
    const base = kind === 'images' ? CONFIG.imagesPath : CONFIG.videosPath;
    return list.map(name => ({ name, url: `${base}/${name}` }));
  }

  async function loadFiles(kind) {
    const path = kind === 'images' ? CONFIG.imagesPath : CONFIG.videosPath;
    try {
      const files = await fetchFromGitHubAPI(path);
      if (files.length) return files;
      throw new Error('empty folder from API');
    } catch (err) {
      console.warn(`[gallery] GitHub API unavailable for ${kind}, trying manifest.json`, err.message);
      try {
        return await fetchFromManifest(kind);
      } catch (err2) {
        console.warn(`[gallery] manifest.json unavailable for ${kind}`, err2.message);
        return [];
      }
    }
  }

  /* ---------------- Images: masonry + lightbox ---------------- */
  let lightboxItems = [];
  let lightboxIndex = 0;

  function buildLightbox() {
    if (document.querySelector('.lightbox')) return;
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Close">✕</button>
      <button class="lightbox-nav prev" aria-label="Previous">‹</button>
      <img alt="">
      <button class="lightbox-nav next" aria-label="Next">›</button>
    `;
    document.body.appendChild(lb);

    lb.querySelector('.lightbox-close').addEventListener('click', () => closeLightbox());
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    lb.querySelector('.prev').addEventListener('click', () => showLightbox(lightboxIndex - 1));
    lb.querySelector('.next').addEventListener('click', () => showLightbox(lightboxIndex + 1));
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
      if (e.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
    });
  }

  function showLightbox(i) {
    const lb = document.querySelector('.lightbox');
    lightboxIndex = (i + lightboxItems.length) % lightboxItems.length;
    lb.querySelector('img').src = lightboxItems[lightboxIndex].url;
    lb.querySelector('img').alt = lightboxItems[lightboxIndex].name;
    lb.classList.add('open');
  }
  function closeLightbox() {
    document.querySelector('.lightbox')?.classList.remove('open');
  }

  async function renderImages() {
    if (!imageGrid) return;
    const all = await loadFiles('images');
    const files = all.filter(f => CONFIG.imageExts.includes(extOf(f.name)));
    lightboxItems = files;

    if (!files.length) {
      imageGrid.innerHTML = `<div class="gallery-empty">No images found yet.<br>Drop files into <code>assets/images/</code> and they'll show up here automatically.</div>`;
      return;
    }

    buildLightbox();
    imageGrid.innerHTML = files.map((f, i) => `
      <figure class="masonry-item" data-index="${i}">
        <img src="${f.url}" alt="${titleize(f.name)}" loading="lazy">
        <figcaption class="cap">${titleize(f.name)}</figcaption>
      </figure>
    `).join('');

    imageGrid.querySelectorAll('.masonry-item').forEach(item => {
      item.addEventListener('click', () => showLightbox(parseInt(item.dataset.index, 10)));
    });
  }

  /* ---------------- Videos ---------------- */
  async function renderVideos() {
    if (!videoGrid) return;
    const all = await loadFiles('videos');
    const files = all.filter(f => CONFIG.videoExts.includes(extOf(f.name)));

    if (!files.length) {
      videoGrid.innerHTML = `<div class="gallery-empty">No videos found yet.<br>Drop files into <code>assets/videos/</code> and they'll show up here automatically.</div>`;
      return;
    }

    videoGrid.innerHTML = files.map(f => `
      <div class="video-card">
        <div class="video-wrap">
          <video controls preload="metadata" playsinline poster="">
            <source src="${f.url}" type="video/${extOf(f.name) === 'mov' ? 'quicktime' : extOf(f.name)}">
            Your browser doesn't support embedded video. <a href="${f.url}">Download it here</a>.
          </video>
        </div>
        <div class="video-card-meta">
          <h4>${titleize(f.name)}</h4>
          <span>HD · ${extOf(f.name).toUpperCase()}</span>
        </div>
      </div>
    `).join('');
  }

  renderImages();
  renderVideos();

  /* ---------------- Tabs (images / videos) ---------------- */
  const tabs = document.querySelectorAll('.gallery-tab');
  const panels = document.querySelectorAll('.gallery-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel)?.classList.add('active');
    });
  });
})();
