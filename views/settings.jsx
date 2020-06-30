const React = require('react');
const Banner = require('./partial/banner.jsx');
const GuiUtils = require('../scripts/GuiUtils.js');
const { dialog } = require('electron').remote;
let userDefinedWalletPath;
let userDefinedNodeURL = false;
let userNetworkIx;
let userNodeURL = '';
let walletPath = '';
let initUserNodeURL = false;
let initUserWalletPath = false;

module.exports = (props) => {
  const App = props.App;
  const GuiToggles = props.GuiToggles;
  const userShowBalance = App.getUserShowBalance();
  const defaultWalletPath = App.getDefaultWalletPath();
	
	if (!initUserNodeURL) {
		userNodeURL = App.getUserNodeURL();
		initUserNodeURL = true;
		if (userNodeURL.length > 0) {
			userDefinedNodeURL = true;
			userNetworkIx = 99;
		} else {
			userDefinedNodeURL = false;
		}
	}
	
	if (!initUserWalletPath) {
		walletPath = App.getWalletPath();
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
			App.setUserNodeURL(userNodeURL);
		}
		
		App.setRestService(userNetworkIx);
		GuiUtils.setValue('networkPicker', userNetworkIx);
		App.refreshBlockchainData();
		App.renderApp();
  }
	
	const changeUserNodeURL = () => {
		userNodeURL = GuiUtils.getValue('userNodeURL');
		if (userNodeURL.length > 0) {
			userDefinedNodeURL = true;
			GuiUtils.setValue('networkPicker', 99);
		} else {
			userDefinedNodeURL = false;
		}
		App.renderApp();
	}
  
  const changeNodeURL = () => {
		App.changeNodeURL();
  }
  
  const changeWalletPath = () => {
		let selectedWalletPath = dialog.showOpenDialogSync({
			properties: ['openDirectory']
		});
		
		if (selectedWalletPath) {
			GuiUtils.setValue('walletFolderPath', selectedWalletPath.toString());
			App.setWalletPath(selectedWalletPath.toString());
			userDefinedWalletPath = true;
		}
		initUserWalletPath = false;
		App.renderApp();
  }
  
  const resetWalletFolderPath = () => {
    GuiUtils.setValue('walletFolderPath', '');
		userDefinedWalletPath = false;
		App.setWalletPath(defaultWalletPath);
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
		let updateUserNodeURL = GuiUtils.getValue('userNodeURL');
		let updateUserWalletPath = GuiUtils.getValue('walletFolderPath');
		let updateUserShowBalance;
		if (GuiUtils.getChecked('userShowBalanceRadio')) {
			updateUserShowBalance = true;
		} else {
			updateUserShowBalance = false;
		}
		App.updateConfigFile(updateUserNodeURL, updateUserWalletPath, updateUserShowBalance);
		//App.resetConfigInitialized();
		//App.readConfigFile();
  }
	
	const exitPage = () => {	
		if (App.getLoggedIn()) {
			GuiToggles.showHome();
		} else {
			GuiToggles.showLanding();
		}
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
						<select defaultValue={userNetworkIx} className="settingsOptions" id="networkPicker" name="networkPicker" style={{background: "inherit"}} onChange={(e)=> changeNetwork(e)}>
							<option value="0">{App.REST_SERVICES[0].name}</option>
							<option value="1">{App.REST_SERVICES[1].name}</option>
							{userDefinedNodeURL ? <option value="99">custom</option> : undefined}
						</select>
						<input className="settingsInput" type="text" size="22" id="userNodeURL" name="userNodeURL" style={{background: "inherit"}} placeholder={!userDefinedNodeURL ? App.getRestService() : undefined} defaultValue={userDefinedNodeURL ? App.getUserNodeURL() : undefined} onChange={(e) => changeUserNodeURL()} />				
					</td>
						<td className="settingCol3"><button style={userDefinedNodeURL ? {display: 'block'} : {display: 'none'}} className="settingsButton dark-hover" onClick={(e) => changeNodeURL()}>Change</button>
						</td>
				</tr>
				<tr className="settingsTableRow">		  	  
					<td className="settingCol1">Wallets path:
					</td>
					<td className="settingCol2">			    
						<input className="settingsInput" type="text" size="33" id="walletFolderPath" name="walletFolderPath" style={{background: "inherit"}} placeholder={defaultWalletPath} defaultValue={userDefinedWalletPath ? App.getWalletPath() : ""} title={App.getWalletPath()} readOnly={true} />		
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
						<input className="enterPassword m15L" type="password" size="18" id="removePassword" placeholder="Enter Password" name="removePassword" />
					</td>
					<td className="settingCol3"><button className="settingsButton dark-hover" onClick={(e) => removeWallet()}>Remove</button>
					</td>
				</tr>
				</tbody>
			</table>
		</div>
		<button className="saveConfig scale-hover" onClick={(e)=> useSaveConfig()}>
		<p>Save Config</p>
		</button>	
	</div>
</div>);
}
