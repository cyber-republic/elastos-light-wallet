const React = require('react');
const Menu = require('./partial/menu.jsx');
const Banner = require('./partial/banner.jsx');
const GuiUtils = require('../scripts/GuiUtils.js');

let editablePath = false;
let derivationPathLedger = '';
let indexPathLedger = 0;
let ledgerConnected = false;
let walletNameLogin = '';
let showLoginPassword = false;
let showWalletLogin = false;

const LedgerMessage = (props) => {
  const App = props.App;
  let message = '';
  // App.getMainConsole().log('LedgerMessage', App.getLedgerDeviceInfo());
  if (App.getLedgerDeviceInfo()) {
    if (App.getLedgerDeviceInfo().error) {
      message += 'Error:';
      if (App.getLedgerDeviceInfo().message) {
        message += App.getLedgerDeviceInfo().message;
      }
    } else {
      if (App.getLedgerDeviceInfo().message) {
        message += App.getLedgerDeviceInfo().message;
      }
    }
  }
  return message;
}

const UseLedgerButton = (props) => {
  const App = props.App;
  const GuiToggles = props.GuiToggles;
  const useLedger = () => {
    App.getPublicKeyFromLedger();
    if (!App.getLedgerDeviceInfo().error) {
      //editablePath = false; // keep Ledger path on login
      GuiToggles.showHome();
    }
  }
  if (App.getLedgerDeviceInfo() ? App.getLedgerDeviceInfo().enabled : false) {
    return (<img src="artwork/ledgerconnected.svg" title="Connect with Ledger device" width="235px" height="198px" className="ledgercon ledgeranimation dark-hover" onClick={(e) => useLedger()} />);
  } else {
    return (<img src="artwork/ledgernotconnected.svg" title="No Ledger device connected" width="140px" height="36px" title="Not Connected" className="ledgernotcon dark-hover" />);
  }
}

module.exports = (props) => {
  const App = props.App;
  const GuiToggles = props.GuiToggles;
  const openDevTools = props.openDevTools;
  const Version = props.Version;
  let configFile = App.readConfigFile();
  let folderStatus = App.createWalletFolder();
  
  const showMenu = () => {
    GuiToggles.showMenu('landing');
  }
  
  const refreshLedger = () => {
    App.setPollForAllInfoTimer();
  }
  
  const editPath = (props) => {
    if (!editablePath) {
      editablePath = true;
      GuiUtils.setValue('derivationPathLedger', "0");
    } else {
      editablePath = false;
      GuiUtils.setValue('derivationPathLedger', "");
    }  
    App.renderApp();  
  }
  
  const validatePath = () => {
    derivationPathLedger = GuiUtils.getValue('derivationPathLedger');
    
    if (derivationPathLedger == "") {
      indexPathLedger = 0;
    } else {
      var pathArr = derivationPathLedger.split("/");
      var indexPathLedger = pathArr[pathArr.length-1];
    }
    if (!App.isValidDecimal(indexPathLedger)) {
      GuiUtils.setValue('derivationPathLedger', '');
      editablePath = false;
      App.renderApp();
    }
  }
  
  if (App.getLedgerDeviceInfo() ? App.getLedgerDeviceInfo().enabled : false) {
    ledgerConnected = true;
  } else {
    ledgerConnected = false;
  };
  
  const changeWallet = (props) => {
    walletNameLogin = GuiUtils.getValue('walletNameLogin');
    App.renderApp();
  }
  
  const useWalletLogin = () => {  
    const success = App.loginWithWallet();
    if(success) {
      showWalletLogin = false;
      //editablePath = false; // keep Ledger path on login
      GuiToggles.showHome();
    }
  }
  
  let walletFiles = App.listWalletFiles(),
    MakeItem = function(item) {
    return <option key={item}>{item}</option>;
  }  
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      useWalletLogin();
    }
  }
  
  const showPassword = () => {
    //var elementID = event.target.id;
    if (showLoginPassword) {
      showLoginPassword = false;
    } else {
      showLoginPassword = true;
    }
    App.renderApp();    
  }
  
  const closeModal = () => {
    showWalletLogin = false;
    App.renderApp();    
  }
  
  const showWalletLoginModal = () => {
    showWalletLogin = true;
    App.renderApp();    
  }
  
  return (<div id="landing">
  <Banner App={App} GuiToggles={GuiToggles} page="landing"/>
  <Menu App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} page="landing"/>
  <header>
    <img src="artwork/refreshicon.svg" className="refresh-icon" title="Refresh" onClick={(e) => refreshLedger()} />
    <nav id="landingMenuOpen" title="menu" onClick={(e) => showMenu()}>
      <img src="artwork/nav.svg" className="nav-icon dark-hover" onClick={(e) => showMenu()}/>
    </nav>
  </header>
  <div className="import-div ">
    <img src="artwork/logonew.svg" height="80px" width="240px" className="flexgrow_pt35"/>
    <p className="address-text font_size24 margin_none display_inline_block gradient-font">Create New Wallet</p>
    <div className="flex_center">
      <button className="home-btn scale-hover landing-btnbg" onClick={(e) => GuiToggles.showCreate()}>
        Create
      </button>
    </div>
    <p className="address-text font_size24 margin_none display_inline_block gradient-font">Import Wallet</p>
    <div className="flex_center">
      <button className="home-btn scale-hover landing-btnbg" onClick={(e) => GuiToggles.showImport()}>
        From Mnemonics or Private key
      </button>
    </div>
    <p className="address-text font_size24 margin_none display_inline_block gradient-font">Login</p>    
    <button className="home-btn scale-hover landing-btnbg" onClick={(e) => showWalletLoginModal()}>Login with Password</button>
    <p className={(ledgerConnected) ? "address-text font_size16 w80pct word-breakword clearElement" : "address-text font_size16 w80pct word-breakword"}>Ledger Status:&nbsp;
      <LedgerMessage App={App}/></p>
    <div style={App.getCurrentAdvancedFeatures() ? {display: 'block'} : {display: 'none'}}>
      <div style={(ledgerConnected && editablePath) ? {display: 'block'} : {display: 'none'}} className="derivationPathTextLedger">m/44'/2305'/0'/0/</div>
      <input style={(ledgerConnected) ? {display: 'flex'} : {display: 'none'}} type="text" size="4" maxLength={4} className={!editablePath ? "derivationPathPicker ledgerPicker w0px" : "derivationPathPicker ledgerPicker w195px"} id="derivationPathLedger" name="derivationPathLedger" readOnly={!editablePath ? true : false} placeholder="Elastos account (default)" onChange={(e) => validatePath()}/><img style={(ledgerConnected) ? {display: 'flex'} : {display: 'none'}} title="For Advanced users only" className={!editablePath ? "editPathLedger dark-hover padding_5px br5 editOn" : "editPathLedger dark-hover padding_5px br5 editOff"} onClick={(e) => editPath()}/>
    </div>
  </div>
  <div>
    <UseLedgerButton App={App} GuiToggles={GuiToggles}/>
  </div>
  
  <div className="statusRequests" style={App.getDevelopMode() ? {display: 'flex'} : {display: 'none'}}>
      <button className="requestsButtons padding_5px display_inline dark-hover br10 cursor_def" onClick={(e) => App.listRequests()}>List requests</button>
      <button className="requestsButtons padding_5px display_inline dark-hover br10 cursor_def m15L" onClick={(e) => App.clearRequests()}>Clear requests</button>
    </div>
    
  <div className="bg-modal" style={showWalletLogin ? {display: 'flex'} : {display: 'none'}}>
    <div className="modalContent w450px h250px">
      <div className="closeModal" onClick={(e) => closeModal()}>
        <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
      </div>
      <div>
        <span className="address-text modal-title gradient-font">Login to wallet</span>
      </div>
      <div className="m15T">
        <select tabIndex="1" className="walletPicker" id="walletNameLogin" name="walletNameLogin" /*onChange={(e) => changeWallet()}*/>
          <option value="">Select wallet</option>
          {walletFiles.map(MakeItem)}
        </select>
      </div>
      <div className="m15T">
        <input tabIndex="2" className="enterPassword" type={showLoginPassword ? "text" : "password"} size="18" id="loginPassword" placeholder="Enter Password" name="loginPassword" onKeyDown={handleKeyDown}/>
        <img className={showLoginPassword ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword()} />
      </div>
      <div className="m15T">
        <button className="submitModal scale-hover" onClick={(e) => useWalletLogin()}>Login</button>
      </div>      
    </div>
  </div>
</div>);
}
