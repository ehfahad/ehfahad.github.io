/* Theme runs in the head to apply the theme before first paint. */
'use strict';
var themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
// No choice yet: follow the device theme (and its live changes).
// A manual choice applies to every page until this browser tab is closed (sessionStorage), never longer.
var THEME_KEY = 'site-theme-tab';

function readTabTheme() {
  try { var v = sessionStorage.getItem(THEME_KEY); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; }
}
function saveTabTheme(value) {
  try { sessionStorage.setItem(THEME_KEY, value); } catch (e) { /* Storage may be disabled: the choice then lasts for this page. */ }
}
var themeOverride = readTabTheme();
function applyTheme() {
  var dark = themeOverride === null ? themeMedia.matches : themeOverride === 'dark';
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
  themeOverride = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  saveTabTheme(themeOverride);
  applyTheme();
}
if (themeMedia.addEventListener) themeMedia.addEventListener('change', applyTheme);
else themeMedia.addListener(applyTheme);
applyTheme();
window.addEventListener('pageshow', function () {
  themeOverride = readTabTheme();
  applyTheme();
});
// Remove settings saved by earlier versions (permanent theme keys and the retired desktop-layout switch).
try { ['theme', 'site-theme-mode', 'site-layout'].forEach(function (key) { localStorage.removeItem(key); }); } catch (e) { /* ignore */ }

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
