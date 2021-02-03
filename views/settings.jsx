const React = require('react');
const Banner = require('./partial/banner.jsx');

const {dialog} = require('electron').remote;
const electron = require('electron');
const remote = electron.remote;

let _userCurrency = '';
let userDefinedWalletPath;
let userDefinedNodeURL = false;
let _userNetworkIx;
let _userNodeURL = '';
let _userWalletPath = '';
let _userShowBalance = '';
let _userAdvancedFeatures = '';
let _userContextMenu = '';
let walletPath = '';
let initUserNodeURL = false;
let initUserWalletPath = false;
let showRemovePassword = false;
let showPassphrase = false;
let showExportPassword = false;
let showExportPasswordModal = false;
let showNewPasswordModal = false;
let showOldPasswordWallet = false;
let showNewPasswordWallet = false;
let showConfirmPasswordWallet = false;
let passwordsComplexity = true;
let passwordsMatch = true;
let editableCurrency = false;
let search = '';

module.exports = (props) => {
  const App = props.App;
  const GuiToggles = props.GuiToggles;
  const GuiUtils = props.GuiUtils;
  const defaultWalletPath = App.getDefaultWalletPath();
  _userCurrency = App.getCurrentCurrency();
  _userNetworkIx = App.getCurrentNetworkIx();
  _userShowBalance = App.getCurrentShowBalance();
  _userAdvancedFeatures = App.getCurrentAdvancedFeatures();
  _userContextMenu = App.getCurrentContextMenu();
  
  if (!initUserNodeURL) {
    _userNodeURL = App.getCurrentNodeURL();
    initUserNodeURL = true;
    if (_userNodeURL.length > 0) {
      userDefinedNodeURL = true;
      _userNetworkIx = 99;
    } else {
      userDefinedNodeURL = false;
    }
  }
  
  if (!initUserWalletPath) {
    walletPath = App.getCurrentWalletPath();
    initUserWalletPath = true;
    if (walletPath !== defaultWalletPath) {
      userDefinedWalletPath = true;
    } else {
      userDefinedWalletPath = false;
    }
  }
  
  const changeNetwork = (event) => {    
    _userNetworkIx = (event.target.value);
    if (_userNetworkIx < "99") {
      _userNodeURL = '';
      userDefinedNodeURL = false;
      GuiUtils.setValue('userNodeURL', '');
    } else {
      _userNodeURL = GuiUtils.getValue('userNodeURL');
      if (_userNodeURL.length > 0) {
        userDefinedNodeURL = true;
        _userNetworkIx = "99";        
        App.setCurrentNodeURL(_userNodeURL);
      }
    }    
    App.setRestService(_userNetworkIx);
    GuiUtils.setValue('userNetworkIx', _userNetworkIx);
    App.requestBlockchainData(true);
    App.renderApp();
  }
  
  const changeUserNodeURL = () => {
    _userNodeURL = GuiUtils.getValue('userNodeURL');
    if (_userNodeURL.length > 0) {
      userDefinedNodeURL = true;
      GuiUtils.setValue('userNetworkIx', 99);
    } else {
      GuiUtils.setValue('userNetworkIx', _userNetworkIx);
      userDefinedNodeURL = false;
    }
    App.renderApp();
  }
  
  const changeNodeURL = () => {
    App.changeNodeURL();
  }
  
  const changeWalletPath = () => {
    _userWalletPath = dialog.showOpenDialogSync({
      properties: ['openDirectory']
    });
    
    if (_userWalletPath) {
      GuiUtils.setValue('userWalletPath', _userWalletPath.toString());
      App.setCurrentWalletPath(_userWalletPath.toString());
      userDefinedWalletPath = true;
    }
    initUserWalletPath = false;
    App.renderApp();
  }
  
  const resetWalletFolderPath = () => {
    GuiUtils.setValue('userWalletPath', '');
    userDefinedWalletPath = false;
    App.setCurrentWalletPath(defaultWalletPath);
    initUserWalletPath = false;
    App.renderApp();
  }
  
  const removeWallet = () => {
    App.removeWalletFile();
  }
  
  let walletFiles = App.listWalletFiles(),
  walletItem = function(item) {
    if (item !== App.getWalletNameLogin()) {
      return <option key={item}>{item}</option>;
    }
  }
  
  const selectCurrency = () => {
    if (!editableCurrency) {
      editableCurrency = true;
      GuiUtils.setValue('userCurrency', '');
      search = '';
    } else {
      resetCurrency();
    }
    App.renderApp();
  }
  
  const resetCurrency = () => {
    editableCurrency = false;
    GuiUtils.setValue('userCurrency', _userCurrency.toUpperCase());
    App.renderApp();
  }
  
  const changeCurrency = (e) => {
    _userCurrency = e.target.innerHTML.toLowerCase();
    GuiUtils.setValue('userCurrency', _userCurrency.toUpperCase());
    GuiUtils.setPlaceholder('userCurrency', _userCurrency.toUpperCase());
    App.setCurrentCurrency(_userCurrency);
    editableCurrency = false;
    App.renderApp();
  }
    
  let fiatCurrencies = App.getParsedFiatList(),
  fiatItem = function(item, index) {
    if (item.substring(0, search.length) === search) {
      return <div key={index} className={(item === _userCurrency) ? "selectorItem selectorItemSelected" : "selectorItem"} onMouseDown={(e) => changeCurrency(e)}>{item.toUpperCase()}</div>;
    }    
  }
  
  let cryptoCurrencies = App.getParsedCryptoList(), 
  cryptoItem = function(item, index) {
    if (item.substring(0, search.length) === search) {
      return <div key={index} className={(item === _userCurrency) ? "selectorItem selectorItemSelected" : "selectorItem"} onMouseDown={(e) => changeCurrency(e)}>{item.toUpperCase()}</div>;      
    }
  }
  
  const searchCurrency = () => {
    search = GuiUtils.getValue('userCurrency').toLowerCase();
    App.renderApp();
  }
  
  const enableShowBalance = () => {
    App.setCurrentShowBalance(GuiUtils.getChecked('userShowBalance'));
  }
  
  const enableAdvancedFeatures = () => {
    App.setCurrentAdvancedFeatures(GuiUtils.getChecked('userAdvancedFeatures'));
  }
  
  const enableContextMenu = () => {
    if (GuiUtils.getChecked('userContextMenu')) {
      App.enableContextMenu();
    } else {
      App.disableContextMenu();
    }
    App.setCurrentContextMenu(GuiUtils.getChecked('userContextMenu'));
  }
  
  const useSaveConfig = () => {
    let updateCurrency = GuiUtils.getValue('userCurrency');
    let updateNetworkIx = GuiUtils.getValue('userNetworkIx');
    let updateNodeURL = GuiUtils.getValue('userNodeURL');
    if (updateNetworkIx == 99 && updateNodeURL.length === 0) {
      updateNetworkIx = App.getDefaultNetworkIx();
      updateNodeURL = "";
      GuiUtils.setValue('userNetworkIx', updateNetworkIx);
    }
    let updateWalletPath = GuiUtils.getValue('userWalletPath');
    let updateShowBalance;
    let updateAdvancedFeatures;
    let updateContextMenu;
    if (GuiUtils.getChecked('userShowBalance')) {
      updateShowBalance = true;
    } else {
      updateShowBalance = false;
    }
    if (GuiUtils.getChecked('userAdvancedFeatures')) {
      updateAdvancedFeatures = true;
    } else {
      updateAdvancedFeatures = false;
    }
    if (GuiUtils.getChecked('userContextMenu')) {
      updateContextMenu = true;
    } else {
      updateContextMenu = false;
    }
    App.updateConfigFile(updateCurrency, updateNetworkIx, updateNodeURL, updateWalletPath, updateShowBalance, updateAdvancedFeatures, updateContextMenu);    
  }
  
  const reloadConfig = () => {
    initUserNodeURL = false;
    initUserWalletPath = false;
    showRemovePassword = false;
    
    _userCurrency = App.getConfigCurrency();
    _userNetworkIx = App.getConfigNetworkIx();
    _userNodeURL = App.getConfigNodeURL();
    _userWalletPath = App.getConfigWalletPath();
    _userShowBalance = App.getConfigShowBalance();
    _userAdvancedFeatures = App.getConfigAdvancedFeatures();
    _userContextMenu = App.getConfigContextMenu();
    
    resetCurrency();
    App.setCurrentCurrency(_userCurrency);
    
    App.setRestService(_userNetworkIx);
    if (_userNodeURL.length > 0) {
      userDefinedNodeURL = true;
      GuiUtils.setValue('userNetworkIx', 99);
      GuiUtils.setValue('userNodeURL', _userNodeURL);
    } else {
      GuiUtils.setValue('userNetworkIx', _userNetworkIx);
      GuiUtils.setValue('userNodeURL', '');
      userDefinedNodeURL = false;
    }
    
    GuiUtils.setValue('userWalletPath', _userWalletPath.toString());
    if (_userWalletPath) {
      App.setCurrentWalletPath(_userWalletPath.toString());
      userDefinedWalletPath = true;
    } else {
      resetWalletFolderPath();
    }    
    
    App.setCurrentShowBalance(_userShowBalance);
    if (_userShowBalance) {
      GuiUtils.setChecked('userShowBalance', true);
    } else {
      GuiUtils.setChecked('userShowBalance', false);
    }
    
    App.setCurrentAdvancedFeatures(_userAdvancedFeatures);
    if (_userAdvancedFeatures) {
      GuiUtils.setChecked('userAdvancedFeatures', true);
    } else {      
      GuiUtils.setChecked('userAdvancedFeatures', false);
    }
    
    App.setCurrentContextMenu(_userContextMenu);
    if (_userContextMenu) {
      GuiUtils.setChecked('userContextMenu', true);
    } else {      
      GuiUtils.setChecked('userContextMenu', false);
    }
    
    App.showBanner(`Configuration file reloaded`, 'bg_green color_white banner-look', true);
    App.renderApp();
  }
  
  const showExportModal = () => {
    if (App.getPassphraseFlag()) {
      if (GuiUtils.getValue('exportPassphrase').length === 0) {
        App.showBanner(`Please enter Passphrase`, 'bg_red color_white banner-look', false);
        App.renderApp();
        return false;
      }
    }
    showExportPasswordModal = true;
    App.renderApp();
  }
  
  const showNewPassword = () => {
    showNewPasswordModal = true;
    App.renderApp();
  }
  
  const closeModal = () => {
    if (showExportPasswordModal || showNewPasswordModal) {
      showExportPasswordModal = false;
      showNewPasswordModal = false;
      App.renderApp();
    }
  }
  
  const changePassword = () => {
    let success = App.changePassword();
    if (success)  {
      showNewPasswordModal = false;
      clearPasswordFields();
    }
  }
  
  const clearPasswordFields = () => {
    GuiUtils.setValue('removePassword', '');
    GuiUtils.setValue('exportPassphrase', '');
    GuiUtils.setValue('exportPassword', '');
    GuiUtils.setValue('oldPasswordWallet', '');
    GuiUtils.setValue('newPasswordWallet', '');
    GuiUtils.setValue('confirmPasswordWallet', '');
  }
  
  const comparePasswords = () => {
    if (App.getPasswordRegEx().test(GuiUtils.getValue('newPasswordWallet'))) {
      passwordsComplexity = true;
    } else {
      passwordsComplexity = false;
    }
      
    if (GuiUtils.getValue('newPasswordWallet') === GuiUtils.getValue('confirmPasswordWallet')) {
      passwordsMatch = true;
    } else {
      passwordsMatch = false;
    }
    App.renderApp();
  }
    
  const exitPage = () => {
    showRemovePassword = false;
    clearPasswordFields();
    resetCurrency();    
    if (App.getLoggedIn()) {
      GuiToggles.showHome();
    } else {
      GuiToggles.showLanding();
    }
  }
  
  const showPassword = (event) => {
    var elementID = event.target.id;
    if (elementID === "exportPassphraseEye") {
      if (showPassphrase) {
        showPassphrase = false;
      } else {
        showPassphrase = true;
      }      
    } else if (elementID === "removePasswordEye") {
      if (showRemovePassword) {
        showRemovePassword = false;
      } else {
        showRemovePassword = true;
      }      
    } else if (elementID === "exportPasswordEye") {
      if (showExportPassword) {
        showExportPassword = false;
      } else {
        showExportPassword = true;
      }      
    } else if (elementID === "oldPasswordWalletEye") {
      if (showOldPasswordWallet) {
        showOldPasswordWallet = false;
      } else {
        showOldPasswordWallet = true;
      }      
    } else if (elementID === "newPasswordWalletEye") {
      if (showNewPasswordWallet) {
        showNewPasswordWallet = false;
      } else {
        showNewPasswordWallet = true;
      }      
    } else if (elementID === "confirmPasswordWalletEye") {
      if (showConfirmPasswordWallet) {
        showConfirmPasswordWallet = false;
      } else {
        showConfirmPasswordWallet = true;
      }      
    }
    App.renderApp();    
  }
  
  const exportMnemonic = () => {
    let isValid = App.exportMnemonic();
    if (isValid) {
      GuiUtils.setValue('exportPassword', '');
      GuiUtils.setValue('exportPassphrase', '');
      closeModal();
      App.setCreateScreen("export");
      GuiToggles.showExportMnemonic();
    } else {
      closeModal();
    }
  }
  
  module.exports.showExportPasswordModal = showExportPasswordModal;
  module.exports.showNewPasswordModal = showNewPasswordModal;
  module.exports.closeModal = closeModal;
  module.exports.exitPage = exitPage;
  
  return (
<div id="settings">
  <a onClick={(e) => exitPage()}></a>
  <Banner App={App} GuiToggles={GuiToggles} page="settings"/>
  <div className="settings-main-div">
    <div>  
      <img className="settingsBack scale-hover" src="artwork/voting-back.svg" height="38px" width="38px" onClick={(e) => exitPage()}/>
      <div className="settingsTitle">Settings</div>      
    </div>
    <div className="settingsTableDiv scrollbar">
      <table className="settingsTable">
        <tbody>
        <tr className="settingsTableRow">          
          <td className="settingCol1">Node:
          </td>
          <td className="settingCol2">
            <select defaultValue={_userNetworkIx} className="settingsOptions m10L" id="userNetworkIx" name="userNetworkIx" onChange={(e)=> changeNetwork(e)}>
              <option value="0">{App.REST_SERVICES[0].name}</option>
              <option value="1">{App.REST_SERVICES[1].name}</option>
              <option value="99">custom</option>
            </select>
            <input className="settingsInput w209_5px" type="text" size="22" id="userNodeURL" name="userNodeURL" placeholder={App.getRestService()} defaultValue={userDefinedNodeURL ? App.getCurrentNodeURL() : undefined} onChange={(e) => changeUserNodeURL()} />        
          </td>
          <td className="settingCol3">
            <button style={userDefinedNodeURL ? {display: 'inline-block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => changeNodeURL()}>Change</button>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td className="settingCol1">Wallets path:
          </td>
          <td className="settingCol2">          
            <input className="settingsInput" type="text" size="32" id="userWalletPath" name="userWalletPath" placeholder={defaultWalletPath} defaultValue={userDefinedWalletPath ? App.getCurrentWalletPath() : ""} title={App.getCurrentWalletPath()} readOnly={true} />    
          </td>
          <td className="settingCol3">
            <button style={!userDefinedWalletPath ? {display: 'inline-block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => changeWalletPath()}>Change</button>
            <button style={userDefinedWalletPath ? {display: 'inline-block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => resetWalletFolderPath()}>Reset</button>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td className="settingCol1">Remove wallets:
          </td>
          <td className="settingCol2">          
            <select className="settingsOptions m10L" id="walletNameRemove" name="walletNameRemove">
              <option value="">Select wallet</option>
              {walletFiles.map(walletItem)}
            </select>
            <input className="enterPassword m20L" type={showRemovePassword ? "text" : "password"} size="18" id="removePassword" placeholder="Enter Password" name="removePassword" />
            <img id="removePasswordEye" className={showRemovePassword ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />            
          </td>
          <td className="settingCol3"><button className="settingsButton dark-hover" onClick={(e) => removeWallet()}>Remove</button>
          </td>
        </tr>
        <tr style={App.getPasswordFlag() ? {display: 'table-row'} : {display: 'none'}} className="settingsTableRow">          
          <td className="settingCol1">Export mnemonic:
          </td>
          <td style={App.getPassphraseFlag() ? {display: 'table-cell'} : {display: 'none'}} className="settingCol2">          
            <input className="enterPassword m128L" type={showPassphrase ? "text" : "password"} size="18" id="exportPassphrase" placeholder="Enter Passphrase" name="exportPassphrase" />
            <img id="exportPassphraseEye" className={showPassphrase ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />            
          </td>
          <td style={App.getPassphraseFlag() ? {display: 'none'} : {display: 'table-cell'}} className="settingCol2">          
            &nbsp;
          </td>
          <td className="settingCol3">
            <button className="settingsButton dark-hover" onClick={(e) => showExportModal()}>Export</button>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td colSpan="2" className="settingCol1 p28R">Currency:
          </td>
          <td className="settingCol3">
            <input type="text" maxLength="6" readOnly={!editableCurrency ? true : false} placeholder={_userCurrency.toUpperCase()} className="settingsInput selector w80px cursor_def" id="userCurrency" name="userCurrency" onClick={(e) => selectCurrency()} onChange={(e) => searchCurrency()} onBlur={(e) => resetCurrency()}/>
            <span className={!editableCurrency ? "selectorDown" : "selectorUp"}></span>
            <div style={editableCurrency ? {display: 'inline-block'} : {display: 'none'}} className="selectorList">
              <div className="listSeparator">Fiat</div>
              {fiatCurrencies.map(fiatItem)}
              <div className="listSeparator">Crypto</div>
              {cryptoCurrencies.map(cryptoItem)}              
            </div>
          </td>          
        </tr>
        <tr className="settingsTableRow">
          <td colSpan="2" className="settingCol1 p28R">Show balance:
          </td>          
          <td className="settingCol3">
            <label className="m10L switch">
              <input id="userShowBalance" type="checkbox" defaultChecked={_userShowBalance ? true : false} onChange={(e) => enableShowBalance()}/>
              <span className="slider round"></span>
            </label>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td colSpan="2" className="settingCol1 p28R" title="Derivation path selection, UTXO Control, ...">Advanced features:
          </td>          
          <td className="settingCol3">
            <label className="m10L switch">
              <input id="userAdvancedFeatures" type="checkbox" defaultChecked={_userAdvancedFeatures ? true : false} onChange={(e) => enableAdvancedFeatures()}/>
              <span className="slider round"></span>
            </label>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td colSpan="2" className="settingCol1 p28R" title="Enable/Disable right mouse click context menu for Copy/Paste/… Require application restart.">Context Menu:
          </td>          
          <td className="settingCol3">
            <label className="m10L switch">
              <input id="userContextMenu" type="checkbox" defaultChecked={_userContextMenu ? true : false} onChange={(e) => enableContextMenu()}/>
              <span className="slider round"></span>
            </label>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div className="flex-stretch settingsButtons">
      <button className="grayConfigButton scale-hover" onClick={(e)=> reloadConfig()}>Reload Config</button>
      <button style={App.getPasswordFlag() ? {display: 'block'} : {display: 'none'}} className="grayConfigButton scale-hover" onClick={(e)=> showNewPassword()}>Change password</button>
      <button className="orangeConfigButton scale-hover" onClick={(e)=> useSaveConfig()}>Save Config</button>
    </div>    
  </div>
  <div className="bg-modal w400px h200px" style={showExportPasswordModal ? {display: 'flex'} : {display: 'none'}}>
    <a onClick={(e) => closeModal()}></a>
    <div className="modalContent w350px h180px">
      <div className="closeModal" onClick={(e) => closeModal()}>
        <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
      </div>
      <div>
        <span className="address-text modal-title font_size20 gradient-font">Export wallet ({App.getWalletNameLogin()})</span>
      </div>
      <div className="m15T">
        <input type="password" className="enterPassword w200px" type={showExportPassword ? "text" : "password"} size="18" id="exportPassword" placeholder="Enter Password" name="exportPassword"/>
        <img id="exportPasswordEye" className={showExportPassword ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
      </div>
      <div className="m15T">
        <button className="submitModal scale-hover" onClick={(e) => exportMnemonic()}>Export</button>
      </div>
    </div>
  </div>
  <div className="bg-modal w400px h330px" style={showNewPasswordModal ? {display: 'flex'} : {display: 'none'}}>
    <a onClick={(e) => closeModal()}></a>
    <div className="modalContent w350px h300px">
      <div className="closeModal" onClick={(e) => closeModal()}>
        <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
      </div>
      <div>
        <span className="address-text modal-title font_size20 gradient-font">Change password ({App.getWalletNameLogin()})</span>
      </div>
      <div className="m15T">
        <input type="password" className="enterPassword w215px" type={showOldPasswordWallet ? "text" : "password"} size="18" id="oldPasswordWallet" placeholder="Old Password" name="oldPasswordWallet"/>
        <img id="oldPasswordWalletEye" className={showOldPasswordWallet ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
      </div>
      <div className="m15T">
        <input type="password" className="enterPassword w215px" type={showNewPasswordWallet ? "text" : "password"} size="18" id="newPasswordWallet" placeholder="New Password" name="newPasswordWallet" onChange={(e) => comparePasswords()}/>
        <img id="newPasswordWalletEye" className={showNewPasswordWallet ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
        <br /><span className={passwordsComplexity ? "infoText color_gray border_gray" : "infoText color_red border_red"}>Min. 8 characters, at least one uppercase, lowercase, number and special character</span>
      </div>
      <div className="m15T">
        <input type="password" className="enterPassword w215px" type={showConfirmPasswordWallet ? "text" : "password"} size="18" id="confirmPasswordWallet" placeholder="Confirm Password" name="confirmPasswordWallet" onChange={(e) => comparePasswords()}/>
        <img id="confirmPasswordWalletEye" className={showConfirmPasswordWallet ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
        <br /><span style={!passwordsMatch ? {display: 'inline-block'} : {display: 'none'}} className="infoText color_red border_red">Passwords do not match</span>
      </div>
      <div className="m15T">
        <button className="submitModal scale-hover" onClick={(e) => changePassword()}>Change</button>
      </div>
    </div>
  </div>
</div>);
}