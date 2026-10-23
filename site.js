/* Theme runs in the head to apply the device preference before first paint. */
'use strict';
var themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
// A manual choice lasts only for this page load. Never restore a saved theme.
var themeOverride = null;

function readPreference(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
}
function savePreference(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* Private storage may be disabled. */ }
}
function applyTheme() {
  var dark = themeOverride === null ? themeMedia.matches : themeOverride;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  var control = document.getElementById('theme-toggle');
  if (control) {
    control.setAttribute('aria-pressed', String(dark));
    control.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  var color = document.querySelector('meta[name="theme-color"]');
  if (color) color.content = dark ? '#12161c' : '#1d4e89';
}
function toggleTheme() {
  themeOverride = document.documentElement.dataset.theme !== 'dark';
  applyTheme();
}
if (themeMedia.addEventListener) themeMedia.addEventListener('change', applyTheme);
else themeMedia.addListener(applyTheme);
applyTheme();
window.addEventListener('storage', function (event) {
  if (event.key === 'site-layout' || event.key === null) applyLayout();
});
window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    themeOverride = null;
    applyTheme();
  }
});

/* Some phone browsers keep the phone viewport for "Request desktop site".
   This explicit fallback changes the viewport without user-agent guessing. */
function applyLayout() {
  var desktop = readPreference('site-layout', 'responsive') === 'desktop';
  document.documentElement.dataset.layout = desktop ? 'desktop' : 'responsive';
  document.querySelector('meta[name="viewport"]').content = desktop
    ? 'width=1100, viewport-fit=cover'
    : 'width=device-width, initial-scale=1, viewport-fit=cover';
  document.querySelectorAll('.layout-switch').forEach(function (button) {
    button.textContent = desktop ? 'Use responsive layout' : 'Use desktop layout';
  });
}
function toggleLayout() {
  savePreference('site-layout', document.documentElement.dataset.layout === 'desktop' ? 'responsive' : 'desktop');
  applyLayout();
}
applyLayout();

function toggleMenu(button) {
  var nav = button.closest('nav');
  button.setAttribute('aria-expanded', String(nav.classList.toggle('open')));
}
function closeMenu(returnFocus) {
  var nav = document.querySelector('nav');
  var button = nav.querySelector('.menu-btn');
  if (nav.classList.contains('open')) {
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }
}

function showTab(group, id, updateUrl) {
  var tabs = Array.from(document.querySelectorAll('.tab[data-g="' + group + '"]'));
  if (!tabs.some(function (tab) { return tab.dataset.id === id; })) return;
  document.querySelectorAll('[data-g="' + group + '"]').forEach(function (element) {
    var active = element.dataset.id === id;
    element.classList.toggle('on', active);
    if (element.classList.contains('tab')) {
      element.setAttribute('aria-selected', String(active));
      element.tabIndex = active ? 0 : -1;
    } else element.hidden = !active;
  });
  if (updateUrl !== false) {
    var hash = id === 'sel' ? 'selected' : id;
    if (location.hash !== '#' + hash) history.pushState(null, '', '#' + hash);
  }
}
function tabFromUrl() {
  var id = location.hash.slice(1);
  if (id === 'selected' || id === '') id = 'sel';
  showTab('p', id, false);
}
window.addEventListener('hashchange', tabFromUrl);
window.addEventListener('popstate', tabFromUrl);

function filt(category) {
  document.querySelectorAll('.chip').forEach(function (button) {
    var active = button.dataset.c === category;
    button.classList.toggle('on', active);
    button.setAttribute('aria-pressed', String(active));
  });
  var count = 0;
  document.querySelectorAll('.news li').forEach(function (item) {
    item.hidden = category !== 'all' && item.dataset.c !== category;
    if (!item.hidden) count++;
  });
  document.querySelectorAll('.yblock').forEach(function (block) {
    block.hidden = !Array.from(block.querySelectorAll('li')).some(function (item) { return !item.hidden; });
  });
  var status = document.getElementById('news-status');
  if (status) status.textContent = count + (count === 1 ? ' update shown' : ' updates shown');
}

document.addEventListener('DOMContentLoaded', function () {
  applyTheme();
  applyLayout();
  tabFromUrl();
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    list.addEventListener('keydown', function (event) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      var tabs = Array.from(list.querySelectorAll('[role="tab"]'));
      var index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      showTab(tabs[index].dataset.g, tabs[index].dataset.id);
      tabs[index].focus();
    });
  });
  if (document.querySelector('.chips')) filt('all');
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu(true);
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('nav') || event.target.closest('.menu a')) closeMenu(false);
  });
  var narrow = window.matchMedia('(max-width: 960px)');
  if (narrow.addEventListener) narrow.addEventListener('change', function () { closeMenu(false); });
  var dialog = document.getElementById('figure-dialog');
  var opener;
  document.querySelectorAll('.figure-open').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
      event.preventDefault();
      opener = link;
      var source = link.querySelector('img');
      dialog.querySelector('img').src = source.src;
      dialog.querySelector('img').alt = source.alt;
      document.getElementById('figure-caption').textContent = source.alt;
      dialog.showModal();
    });
  });
  dialog.addEventListener('close', function () { if (opener) opener.focus(); });
  dialog.addEventListener('click', function (event) {
    var bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
});
