const REPO_BASE = 'https://github.com/NitCelcius/GTFS-JP_Wayfinder';

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('themeIcon');
  icon.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';

  // Save preference
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Load saved theme on page load
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeIcon').textContent = '🌙';
  }
}

// Generate random suffix
function generateRandomSuffix(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function init() {
  loadTheme();
  document.getElementById('projectName').value = 'gtfs-jp-wayfinder-' + generateRandomSuffix();
  updateComputedValues();

  // Setup basic auth toggle
  document.getElementById('enableBasicAuth').addEventListener('change', function () {
    document.getElementById('basicAuthFields').style.display = this.checked ? 'block' : 'none';
  });

  // Track deploy button clicks
  let clickedButtons = { web: false, api: false };

  document.getElementById('deployWebBtn').addEventListener('click', function (e) {
    if (!this.classList.contains('disabled')) {
      clickedButtons.web = true;
      checkCompletion(clickedButtons);
    }
  });

  document.getElementById('deployApiBtn').addEventListener('click', function (e) {
    if (!this.classList.contains('disabled')) {
      clickedButtons.api = true;
      checkCompletion(clickedButtons);
    }
  });
}

function checkCompletion(clickedButtons) {
  if (clickedButtons.web && clickedButtons.api) {
    document.getElementById('completionCard').classList.add('show');
    // Scroll to completion card smoothly
    setTimeout(() => {
      document.getElementById('completionCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

function getProjectNames() {
  const baseName = document.getElementById('projectName')?.value || 'gtfs-jp-wayfinder-' + generateRandomSuffix();
  const customWebName = document.getElementById('customWebName')?.value?.trim() || '';
  const customApiName = document.getElementById('customApiName')?.value?.trim() || '';

  return {
    web: customWebName || `${baseName}-web`,
    api: customApiName || `${baseName}-api`
  };
}

function getUrls() {
  const customWeb = document.getElementById('customWebDomain')?.value?.trim() || '';
  const customApi = document.getElementById('customApiDomain')?.value?.trim() || '';
  const names = getProjectNames();

  return {
    web: customWeb ? `https://${customWeb}` : `https://${names.web}.vercel.app`,
    api: customApi ? `https://${customApi}` : `https://${names.api}.vercel.app`
  };
}

function updateComputedValues() {
  const urls = getUrls();
  document.getElementById('webUrl').textContent = urls.web;
  document.getElementById('apiUrl').textContent = urls.api;
  document.getElementById('tryAppBtn').href = urls.web;
  updateDeployButtons();
}

function updateDeployButtons() {
  const gtfsUrl = document.getElementById('gtfsDataUrl').value.trim();
  const urls = getUrls();
  const names = getProjectNames();
  const enableBasicAuth = document.getElementById('enableBasicAuth').checked;
  const basicAuthUsername = document.getElementById('basicAuthUsername').value;
  const basicAuthPassword = document.getElementById('basicAuthPassword').value;
  const enableGraphCache = document.getElementById('enableGraphCache').checked;

  // Build env vars for Web
  const webEnvVars = [
    `env-NEXT_PUBLIC_API_BASE_URL=${encodeURIComponent(urls.api)}`,
    `env-NEXT_PUBLIC_BASE_URL=${encodeURIComponent(urls.web)}`
  ];

  if (enableBasicAuth && basicAuthUsername && basicAuthPassword) {
    webEnvVars.push(`env-ENABLE_BASIC_AUTH=true`);
    webEnvVars.push(`env-BASIC_AUTH_USERNAME=${encodeURIComponent(basicAuthUsername)}`);
    webEnvVars.push(`env-BASIC_AUTH_PASSWORD=${encodeURIComponent(basicAuthPassword)}`);
  }

  // Build env vars for API
  const apiEnvVars = [
    `env-CORS_ORIGINS=${encodeURIComponent(urls.web)}`
  ];

  if (gtfsUrl) {
    apiEnvVars.push(`env-GTFS_DATA_URL=${encodeURIComponent(gtfsUrl)}`);
  }

  if (enableGraphCache) {
    apiEnvVars.push(`env-ENABLE_GRAPH_CACHE=true`);
  }

  // Web deploy URL (deploy from /web subdirectory)
  const webDeployUrl = `https://vercel.com/new/clone?` +
    `repository-url=${encodeURIComponent(REPO_BASE + '/tree/master/web')}&` +
    `project-name=${encodeURIComponent(names.web)}&` +
    `repository-name=${encodeURIComponent(names.web)}&` +
    `envDescription=${encodeURIComponent('自動で設定されます。必要な場合は編集してください')}&` +
    `envLink=${encodeURIComponent('https://github.com/NitCelcius/GTFS-JP_Wayfinder')}&` +
    webEnvVars.join('&');

  // API deploy URL (deploy from /api subdirectory)
  const apiDeployUrl = `https://vercel.com/new/clone?` +
    `repository-url=${encodeURIComponent(REPO_BASE + '/tree/master/api')}&` +
    `project-name=${encodeURIComponent(names.api)}&` +
    `repository-name=${encodeURIComponent(names.api)}&` +
    `envDescription=${encodeURIComponent('自動で設定されます。必要な場合は編集してください')}&` +
    `envLink=${encodeURIComponent('https://github.com/NitCelcius/GTFS-JP_Wayfinder')}&` +
    apiEnvVars.join('&');

  const webBtn = document.getElementById('deployWebBtn');
  const apiBtn = document.getElementById('deployApiBtn');

  if (gtfsUrl) {
    webBtn.href = webDeployUrl;
    webBtn.classList.remove('disabled');
    apiBtn.href = apiDeployUrl;
    apiBtn.classList.remove('disabled');
  } else {
    webBtn.classList.add('disabled');
    apiBtn.classList.add('disabled');
  }
}

function toggleTip(id) {
  const tooltip = document.getElementById(id);
  tooltip.classList.toggle('show');
}

function toggleAdvanced() {
  const section = document.getElementById('advancedSection');
  const arrow = document.getElementById('advancedArrow');
  section.classList.toggle('show');
  arrow.textContent = section.classList.contains('show') ? '▼' : '▶';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
