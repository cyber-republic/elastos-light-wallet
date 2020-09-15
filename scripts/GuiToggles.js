'use strict';

/* modules */
const GuiUtils = require('./GuiUtils.js');

let app;
let bannerID;
let bannerTimeout = 10000;
let page = '';

const init = (_app) => {
  app = _app;
};

const hide = (id) => {
  GuiUtils.hide(id);
};

const show = (id) => {
  GuiUtils.show(id);
};

const hideEverything = () => {
  hide('home');
  hide('landing');
  hide('import');
  hide('version');
  hide('voting');
  hide('qrcode');
  hide('create');
  hide('settings');
  hideAllBanners();
  hideAllMenus();
};

const hideAllMenus = () => {
  GuiUtils.hide('importBanner');
  GuiUtils.hide('createBanner');
  const menus = ['home', 'landing', 'voting', 'import', 'create'];
  menus.forEach((menu) => {
    hide(menu+'Menu');
    // hide(menu+'MenuOpen');
    hide(menu+'MenuClose');
  });
};

const showLanding = () => {
  page = 'landing';
  hideEverything();
  app.clearSendData();
  app.clearGlobalData();
  app.requestBlockchainData(false);
  show(page);
  show(page+'MenuOpen');
};

const showImport = () => {
  page = 'import';
  hideEverything();
  //app.clearSendData();
  show(page);
  show(page+'MenuOpen');
};

const showHome = () => {
  page = 'home';
  hideEverything();
  //app.clearSendData();
  //app.reloadProducersAndVotes(false);
  show(page);
  show(page+'MenuOpen');
  show('version');
};

const showMenu = (name) => {
  show(name+'Menu');
  hide(name+'MenuOpen');
  show(name+'MenuClose');
  hide('version');
};

const hideMenu = (name) => {
  hide(name+'Menu');
  show(name+'MenuOpen');
  hide(name+'MenuClose');
  show('version');
};

const showVoting = () => {
  page = 'voting';
  hideEverything();
  //app.clearSendData();
  show(page);
  show(page+'MenuOpen');
};

const showQRCode = () => {
  page = 'qrcode';
  hideEverything();
  //app.clearSendData();
  show(page);
};

const showSettings = () => {
  page = 'settings';
  hideEverything();
  //app.clearSendData();
  show(page);
};

const showBanner = (name) => {
  clearTimeout(bannerID);
  bannerID = setTimeout(() => hide(name+'Banner'), bannerTimeout);
  show(name+'Banner');
};

const hideBanner = (name) => {
  clearTimeout(bannerID);
  hide(name+'Banner');
};

const showCreate = () => {
  page = 'create';
  hideEverything();
  app.clearGlobalData();
  app.generateMnemonic();
  show(page);
  show(page+'MenuOpen');
};

const showExportMnemonic = () => {
  page = 'create';
  hideEverything();
  show(page);
  show(page+'MenuOpen');
};

const showAllBanners = (timeout) => {
  clearTimeout(bannerID);
  if (timeout === true) {
    bannerID = setTimeout(() => hideAllBanners(), bannerTimeout);
  }
  GuiUtils.show('landingBanner');
  GuiUtils.show('homeBanner');
  GuiUtils.show('votingBanner');
  GuiUtils.show('importBanner');
  GuiUtils.show('createBanner');
  GuiUtils.show('qrcodeBanner');
  GuiUtils.show('settingsBanner');
};

const hideAllBanners = () => {
  GuiUtils.hide('landingBanner');
  GuiUtils.hide('homeBanner');
  GuiUtils.hide('votingBanner');
  GuiUtils.hide('importBanner');
  GuiUtils.hide('createBanner');
  GuiUtils.hide('qrcodeBanner');
  GuiUtils.hide('settingsBanner');
};

const getPage = () => {
  return page;
}

exports.init = init;
exports.showLanding = showLanding;
exports.showImport = showImport;
exports.showHome = showHome;
exports.showMenu = showMenu;
exports.hideMenu = hideMenu;
exports.showVoting = showVoting;
exports.showQRCode = showQRCode;
exports.showSettings = showSettings;
exports.showBanner = showBanner;
exports.hideBanner = hideBanner;
exports.showCreate = showCreate;
exports.showExportMnemonic = showExportMnemonic;
exports.showAllBanners = showAllBanners;
exports.hideAllBanners = hideAllBanners;
exports.bannerID = bannerID;
exports.getPage = getPage;