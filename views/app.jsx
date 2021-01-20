"use strict";

/** imports */
const React = require('react');
const ReactDOM = require('react-dom');

const electron = require('electron');
const shell = electron.shell;
const remote = electron.remote;
const clipboard = electron.clipboard;

/** views */
const Home = require('./home.jsx');
const Landing = require('./landing.jsx');
const Import = require('./import.jsx');
const Create = require('./create.jsx');
const Voting = require('./voting.jsx');
const QRCode = require('./qrcode.jsx');
const Settings = require('./settings.jsx');

/** modules */
const App = require('../scripts/App.js');
const GuiToggles = require('../scripts/GuiToggles.js');
const GuiUtils = require('../scripts/GuiUtils.js');
const CoinGecko = require('../scripts/CoinGecko.js');

/** constants */
const onLinkClickWhiteList = [
  'https://blockchain.elastos.org',
  'https://news.elastos.org/',
  'https://twitter.com/ElastosInfo',
  'https://www.facebook.com/elastosorg/',
  'https://t.me/elastosgroup',
];


/** functions */

const Version = () => {
  return remote.app.getVersion();
}

const onLinkClick = (event) => {
  event.preventDefault();

  const url = event.currentTarget.href;
  let isInWhitelist = false;
  onLinkClickWhiteList.forEach((prefix) => {
    if(url.startsWith(prefix)) {
      isInWhitelist = true;
    }
  })
  if(!isInWhitelist) {
    alert(url);
    return;
  }

  shell.openExternal(url);
}

const openDevTools = () => {
  try {
    const window = remote.getCurrentWindow();
    window.webContents.openDevTools();
  } catch (e) {
    alert(`error:${e}`)
  }
}

class AppView extends React.Component {

  constructor(props) {
    super(props);
    this.state = { visible: false };
    // this.splash = this.splash.bind(this);
    this.unsplash = this.unsplash.bind(this) 
  }

  componentDidMount(){
    this.unsplash();
    document.addEventListener("keydown", this.keyFunction, false);
  }
  
  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
  }

  unsplash() {
    setTimeout(() => this.setState({visible: true}), 4000);
  }
  
  keyFunction(event) {
    if (event.keyCode === 27) {
      switch (GuiToggles.getPage()) {
        case "create":
          if (GuiToggles.getMenuOpened()) {
            GuiToggles.hideAllMenus(GuiToggles.getPage());
          } else {
            Create.exitPage();
          }
          break;
        case "home":
          if (Home.showPasswordModal || Home.showUTXOs) {
            Home.closeModal();
          } else {
            if (GuiToggles.getMenuOpened()) {
              GuiToggles.hideAllMenus(GuiToggles.getPage());
            } else {
              if (App.getSendStep() === 2) {
                Home.cancelSend();
              } else {
                Home.resetPage();
              }
            }
          }
          break;
        case "import":
          if (Import.showCreateWalletModal) {
            Import.closeModal();
          } else {
            if (GuiToggles.getMenuOpened()) {
              GuiToggles.hideAllMenus(GuiToggles.getPage());
            } else {
              Import.exitPage();
            }
          }
          break;
        case "landing":
          if (GuiToggles.getMenuOpened()) {
            GuiToggles.hideAllMenus(GuiToggles.getPage());
          } else if (Landing.showWalletLoginModal) {
            Landing.closeModal();
          }
          break;
        case "qrcode":
          QRCode.exitPage();
          break;
        case "settings":
          if (Settings.showExportPasswordModal || Settings.showNewPasswordModal) {
            Settings.closeModal();
          } else {
            Settings.exitPage();
          }
          break;
        case "voting":
          if (Voting.showPasswordModal || Voting.showUTXOs) {
            Voting.closeModal();
          } else {
            if (GuiToggles.getMenuOpened()) {
              GuiToggles.hideAllMenus(GuiToggles.getPage());
            } else {
              Voting.exitPage();
            }
          }
          break;
        default:
          break;
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.keyCode == 85) {
      switch (GuiToggles.getPage()) {
        case "home":
          if (Home.showUTXOs) {
            Home.closeModal();
          } else {
            Home.UTXOControl();
          }
          break;
         case "voting":
          if (Voting.showUTXOs) {
            Voting.closeModal();
          } else {
            Voting.UTXOControl();
          }
          break;
        default:
          break;        
      }      
    }
  }

  render() {
    return (
    <div id="app">

      {!this.state.visible && 
      <div className='splash-div h100pct w100pct'>
        <img src="artwork/logonew.svg" height="80px" width="240px" />
        <img src='artwork/iconlw.svg' height="100px" width="100px" className="rotate" /> 
        <div></div>
      </div>}

      <div style={this.state.visible ? {display: 'block'} : {display: 'none'}}>
        <Home App={App} openDevTools={openDevTools} onLinkClick={onLinkClick} GuiToggles={GuiToggles} GuiUtils={GuiUtils} Version={Version}/>
        <Landing App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} GuiUtils={GuiUtils} Version={Version}/>
        <Import App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} GuiUtils={GuiUtils} Version={Version}/>
        <Create App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} Version={Version}/>
        <Voting App={App} openDevTools={openDevTools} onLinkClick={onLinkClick} GuiToggles={GuiToggles} GuiUtils={GuiUtils} Version={Version}/>
        <QRCode App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} Version={Version}/>
        <Settings App={App} openDevTools={openDevTools} onLinkClick={onLinkClick} GuiToggles={GuiToggles} GuiUtils={GuiUtils} Version={Version}/>
      </div>

    </div>)
  }
}

const renderApp = () => {
  ReactDOM.render(<AppView/>, document.getElementById('main'));
};

const onLoad = () => {
  App.init(GuiToggles);
  GuiToggles.init(App);
  CoinGecko.init(App);
  App.setAppClipboard(clipboard);
  App.setAppDocument(document);
  App.setRenderApp(renderApp);
  renderApp();
  GuiToggles.showLanding();
  App.setPollForAllInfoTimer();
}

/** call initialization functions */
window.onload = onLoad;


renderApp();
