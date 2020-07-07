const React = require('react');
const Banner = require('./partial/banner.jsx');
const GuiUtils = require('../scripts/GuiUtils.js');
const {dialog} = require('electron').remote;
const electron = require('electron');
const remote = electron.remote;
let userDefinedWalletPath;
let userDefinedNodeURL = false;
let userNetworkIx;
let userNodeURL = '';
let userWalletPath = '';
let userShowBalance = '';
let userAdvancedFeatures = '';
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

module.exports = (props) => {
  const App = props.App;
  const GuiToggles = props.GuiToggles;
  const defaultWalletPath = App.getDefaultWalletPath();
  userNetworkIx = App.getCurrentNetworkIx();
  userShowBalance = App.getCurrentShowBalance();
  userAdvancedFeatures = App.getCurrentAdvancedFeatures();
  
  if (!initUserNodeURL) {
    userNodeURL = App.getCurrentNodeURL();
    initUserNodeURL = true;
    if (userNodeURL.length > 0) {
      userDefinedNodeURL = true;
      userNetworkIx = 99;
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
    userNetworkIx = (event.target.value);
    if (userNetworkIx < "99") {
      userNodeURL = '';
      userDefinedNodeURL = false;
      GuiUtils.setValue('userNodeURL', '');
    } else {
      userNodeURL = GuiUtils.getValue('userNodeURL');
      userDefinedNodeURL = true;
      userNetworkIx = "99";
      App.setCurrentNodeURL(userNodeURL);
    }    
    App.setRestService(userNetworkIx);
    GuiUtils.setValue('userNetworkIx', userNetworkIx);
    App.refreshBlockchainData();
    App.renderApp();
  }
  
  const changeUserNodeURL = () => {
    userNodeURL = GuiUtils.getValue('userNodeURL');
    if (userNodeURL.length > 0) {
      userDefinedNodeURL = true;
      GuiUtils.setValue('userNetworkIx', 99);
    } else {
      GuiUtils.setValue('userNetworkIx', userNetworkIx);
      userDefinedNodeURL = false;
    }
    App.renderApp();
  }
  
  const changeNodeURL = () => {
    App.changeNodeURL();
  }
  
  const changeWalletPath = () => {
    userWalletPath = dialog.showOpenDialogSync({
      properties: ['openDirectory']
    });
    
    if (userWalletPath) {
      GuiUtils.setValue('userWalletPath', userWalletPath.toString());
      App.setCurrentWalletPath(userWalletPath.toString());
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
  MakeItem = function(item) {
    if (item !== App.getWalletNameLogin()) {
      return <option key={item}>{item}</option>;
    }
  }
  
  const enableShowBalance = () => {
    App.setCurrentShowBalance(GuiUtils.getChecked('userShowBalance'));
  }
  
  const enableAdvancedFeatures = () => {
    App.setCurrentAdvancedFeatures(GuiUtils.getChecked('userAdvancedFeatures'));
  }
  
  const useSaveConfig = () => {
    let updateNetworkIx = GuiUtils.getValue('userNetworkIx');
    let updateNodeURL = GuiUtils.getValue('userNodeURL');
    let updateWalletPath = GuiUtils.getValue('userWalletPath');
    let updateShowBalance;
    let updateAdvancedFeatures;
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
    App.updateConfigFile(updateNetworkIx, updateNodeURL, updateWalletPath, updateShowBalance, updateAdvancedFeatures);    
  }
  
  const reloadConfig = () => {
    initUserNodeURL = false;
    initUserWalletPath = false;
    showRemovePassword = false;
    App.resetConfigData();
    userNetworkIx = App.getConfigNetworkIx();
    userNodeURL = App.getConfigNodeURL();
    userWalletPath = App.getConfigWalletPath();
    userShowBalance = App.getConfigShowBalance();
    userAdvancedFeatures = App.getConfigAdvancedFeatures();
    
    
    if (userNodeURL.length > 0) {
      userDefinedNodeURL = true;
      GuiUtils.setValue('userNetworkIx', 99);
      GuiUtils.setValue('userNodeURL', userNodeURL);
    } else {
      GuiUtils.setValue('userNetworkIx', userNetworkIx);
      GuiUtils.setValue('userNodeURL', '');
      userDefinedNodeURL = false;
    }
    GuiUtils.setValue('userWalletPath', userWalletPath);
    
    if (userShowBalance) {
      GuiUtils.setChecked('userShowBalance', true);
    } else {
      GuiUtils.setChecked('userShowBalance', false);
    }
    
    if (userAdvancedFeatures) {
      GuiUtils.setChecked('userAdvancedFeatures', true);
    } else {      
      GuiUtils.setChecked('userAdvancedFeatures', false);
    }
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
    showExportPasswordModal = false;
    showNewPasswordModal = false;
    App.renderApp();    
  }
  
  const changePassword = () => {
    let success = App.changePassword();
    if (success)  {
      showNewPasswordModal = false;
      GuiUtils.setValue('oldPasswordWallet', '');
      GuiUtils.setValue('newPasswordWallet', '');
      GuiUtils.setValue('confirmPasswordWallet', '');
    }
  }
    
  const exitPage = () => {
    showRemovePassword = false;
    GuiUtils.setValue('removePassword', '');
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
      showExportPasswordModal = false;
      App.setMnemonicScreen("export");
      GuiToggles.showExportMnemonic();
    } else {
      showExportPasswordModal = false;
    }
    App.renderApp();
  }
  
  
  return (
<div id="settings">
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
            <select defaultValue={userNetworkIx} className="settingsOptions" id="userNetworkIx" name="userNetworkIx" style={{background: "inherit"}} onChange={(e)=> changeNetwork(e)}>
              <option value="0">{App.REST_SERVICES[0].name}</option>
              <option value="1">{App.REST_SERVICES[1].name}</option>
              {userDefinedNodeURL ? <option value="99">custom</option> : undefined}
            </select>
            <input className="settingsInput" type="text" size="22" id="userNodeURL" name="userNodeURL" style={{background: "inherit"}} placeholder={!userDefinedNodeURL ? App.getRestService() : undefined} defaultValue={userDefinedNodeURL ? App.getCurrentNodeURL() : undefined} onChange={(e) => changeUserNodeURL()} />        
          </td>
            <td className="settingCol3"><button style={userDefinedNodeURL ? {display: 'block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => changeNodeURL()}>Change</button>
            </td>
        </tr>
        <tr className="settingsTableRow">          
          <td className="settingCol1">Wallets path:
          </td>
          <td className="settingCol2">          
            <input className="settingsInput" type="text" size="32" id="userWalletPath" name="userWalletPath" style={{background: "inherit"}} placeholder={defaultWalletPath} defaultValue={userDefinedWalletPath ? App.getCurrentWalletPath() : ""} title={App.getCurrentWalletPath()} readOnly={true} />    
          </td>
          <td className="settingCol3">
            <button style={!userDefinedWalletPath ? {display: 'block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => changeWalletPath()}>Change</button>
            <button style={userDefinedWalletPath ? {display: 'block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => resetWalletFolderPath()}>Reset</button>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td className="settingCol1">Remove wallets:
          </td>
          <td className="settingCol2">          
            <select className="settingsOptions" style={{background: "inherit"}} id="walletNameRemove" name="walletNameRemove">
              <option value="">Select wallet</option>
              {walletFiles.map(MakeItem)}
            </select>
            <input className="enterPassword m30L" type={showRemovePassword ? "text" : "password"} size="18" id="removePassword" placeholder="Enter Password" name="removePassword" />
            <img id="removePasswordEye" style={(showExportPasswordModal || showNewPasswordModal) ? {display: 'none'} : {display: 'inline'}} className={showRemovePassword ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />            
          </td>
          <td className="settingCol3"><button className="settingsButton dark-hover" onClick={(e) => removeWallet()}>Remove</button>
          </td>
        </tr>
        <tr style={App.getPasswordFlag() ? {display: 'table-row'} : {display: 'none'}} className="settingsTableRow">          
          <td className="settingCol1">Export mnemonic:
          </td>
          <td style={App.getPassphraseFlag() ? {display: 'table-cell'} : {display: 'none'}} className="settingCol2">          
            <input className="enterPassword m143L" type={showPassphrase ? "text" : "password"} size="18" id="exportPassphrase" placeholder="Enter Passphrase" name="exportPassphrase" />
            <img id="exportPassphraseEye" style={(showExportPasswordModal || showNewPasswordModal) ? {display: 'none'} : {display: 'inline'}} className={showPassphrase ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />            
          </td>
          <td style={App.getPassphraseFlag() ? {display: 'none'} : {display: 'table-cell'}} className="settingCol2">          
            &nbsp;
          </td>
          <td className="settingCol3"><button className="settingsButton dark-hover" onClick={(e) => showExportModal()}>Export</button>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td colSpan="2" className="settingCol1 p28R">Show balance:
          </td>          
          <td className="settingCol3">
            <label className="m10L switch">
              <input id="userShowBalance" type="checkbox" defaultChecked={userShowBalance ? true : false} onChange={(e) => enableShowBalance()}/>
              <span className="slider round"></span>
            </label>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td colSpan="2" className="settingCol1 p28R" title="Derivation path selection, ...">Advanced features:
          </td>          
          <td className="settingCol3">
            <label className="m10L switch">
              <input id="userAdvancedFeatures" type="checkbox" defaultChecked={userAdvancedFeatures ? true : false} onChange={(e) => enableAdvancedFeatures()}/>
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
    <div className="modalContent w350px h180px">
      <div className="closeModal" onClick={(e) => closeModal()}>
        <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
      </div>
      <div>
        <span className="address-text modal-title font_size20 gradient-font">Export wallet ({App.getWalletNameLogin()})</span>
      </div>
      <div className="m15T">
        <input type="password" className="enterPassword" type={showExportPassword ? "text" : "password"} size="18" id="exportPassword" placeholder="Enter Password" name="exportPassword"/>
        <img id="exportPasswordEye" className={showExportPassword ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
      </div>
      <div className="m15T">
        <button className="submitModal scale-hover" onClick={(e) => exportMnemonic()}>Export</button>
      </div>
    </div>
  </div>
  <div className="bg-modal w400px h330px" style={showNewPasswordModal ? {display: 'flex'} : {display: 'none'}}>
    <div className="modalContent w350px h300px">
      <div className="closeModal" onClick={(e) => closeModal()}>
        <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
      </div>
      <div>
        <span className="address-text modal-title font_size20 gradient-font">Change password ({App.getWalletNameLogin()})</span>
      </div>
      <div className="m15T">
        <input type="password" className="enterPassword" type={showOldPasswordWallet ? "text" : "password"} size="18" id="oldPasswordWallet" placeholder="Old Password" name="oldPasswordWallet"/>
        <img id="oldPasswordWalletEye" className={showOldPasswordWallet ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
      </div>
      <div className="m15T">
        <input type="password" className="enterPassword" type={showNewPasswordWallet ? "text" : "password"} size="18" id="newPasswordWallet" placeholder="New Password" name="newPasswordWallet"/>
        <img id="newPasswordWalletEye" className={showNewPasswordWallet ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
      </div>
      <div className="m15T">
        <input type="password" className="enterPassword" type={showConfirmPasswordWallet ? "text" : "password"} size="18" id="confirmPasswordWallet" placeholder="Confirm Password" name="confirmPasswordWallet"/>
        <img id="confirmPasswordWalletEye" className={showConfirmPasswordWallet ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
      </div>
      <div className="m15T">
        <button className="submitModal scale-hover" onClick={(e) => changePassword()}>Change</button>
      </div>
    </div>
  </div>
</div>);
}
