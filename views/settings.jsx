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
    return <option key={item}>{item}</option>;
  }
  
  const useSaveConfig = () => {
    let updateNetworkIx = GuiUtils.getValue('userNetworkIx');
    let updateNodeURL = GuiUtils.getValue('userNodeURL');
    let updateWalletPath = GuiUtils.getValue('userWalletPath');
    let updateShowBalance;
    let updateAdvancedFeatures;
    if (GuiUtils.getChecked('userShowBalanceRadio')) {
      updateShowBalance = true;
    } else {
      updateShowBalance = false;
    }
    if (GuiUtils.getChecked('userShowAdvancedRadio')) {
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
      GuiUtils.setChecked('userShowBalanceRadio');
    } else {
      GuiUtils.setChecked('userHideBalanceRadio');
    }
    
    if (userAdvancedFeatures) {
      GuiUtils.setChecked('userShowAdvancedRadio');
    } else {
      GuiUtils.setChecked('userHideAdvancedRadio');
    }
    App.renderApp();
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
  
  const showPassword = () => {
    if (showRemovePassword) {
      showRemovePassword = false;
    } else {
      showRemovePassword = true;
    }
    App.renderApp();
  }
  
  return (<div id="settings">
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
            <input className="settingsInput" type="text" size="33" id="userWalletPath" name="userWalletPath" style={{background: "inherit"}} placeholder={defaultWalletPath} defaultValue={userDefinedWalletPath ? App.getCurrentWalletPath() : ""} title={App.getCurrentWalletPath()} readOnly={true} />    
          </td>
          <td className="settingCol3">
            <button style={!userDefinedWalletPath ? {display: 'block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => changeWalletPath()}>Change</button>
            <button style={userDefinedWalletPath ? {display: 'block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => resetWalletFolderPath()}>Reset</button>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td className="settingCol1">Show balance:
          </td>
          <td className="settingCol2">          
            <input className="m15L" type="radio" id="userShowBalanceRadio" name="userBalanceRadio" value="balanceShow" defaultChecked={userShowBalance ? true : false}/><label>Default Show </label>
            <input className="m15L" type="radio" id="userHideBalanceRadio" name="userBalanceRadio" value="balanceHide" defaultChecked={!userShowBalance ?  true : false}/><label>Default Hide </label>
          </td>
          <td className="settingCol3">
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
            <img className={showRemovePassword ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword()} />            
          </td>
          <td className="settingCol3"><button className="settingsButton dark-hover" onClick={(e) => removeWallet()}>Remove</button>
          </td>
        </tr>
        <tr className="settingsTableRow">          
          <td className="settingCol1" title="Derivation path selection, ...">Advanced features:
          </td>
          <td className="settingCol2">          
            <input className="m15L" type="radio" id="userShowAdvancedRadio" name="userAdvancedRadio" value="advancedShow" defaultChecked={userAdvancedFeatures ? true : false}/><label>Default Show </label>
            <input className="m15L" type="radio" id="userHideAdvancedRadio" name="userAdvancedRadio" value="advancedHide" defaultChecked={!userAdvancedFeatures ?  true : false}/><label>Default Hide </label>
          </td>
          <td className="settingCol3">
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <button className="saveConfig scale-hover" onClick={(e)=> useSaveConfig()}>Save Config</button>
    <button className="reloadConfig scale-hover" onClick={(e)=> reloadConfig()}>Reload Config</button>  
  </div>
</div>);
}
