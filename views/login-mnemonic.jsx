const React = require('react');
const Menu = require('./partial/menu.jsx');
const Banner = require('./partial/banner.jsx');
const GuiUtils = require('../scripts/GuiUtils.js');

let editablePath = false;
let enableSaveWallet = false;
let importType = "mnemonic";
let success = '';

module.exports = (props) => {
  const App = props.App;
  const openDevTools = props.openDevTools;
  const GuiToggles = props.GuiToggles;
  const useProceedButton = () => {
	if (importType === "mnemonic") {
      success = App.getPublicKeyFromMnemonic();
	  //console.log("mnemonic",success);
	} else {
	  success = App.getPublicKeyFromPrivateKey();
	  //console.log("pvtkey",success);
	}
    if(success) {
      GuiToggles.showHome();
    }
  }
  
  const showMenu = () => {
    GuiToggles.showMenu('loginMnemonic');
  }
  
  const editPath = () => {
	if (!editablePath) {
	  editablePath = true;
	  GuiUtils.setValue('derivationPathMnemonic', "m/44'/0'/0'/0/0");
	} else {
	  editablePath = false;
	  GuiUtils.setValue('derivationPathMnemonic', "");
	}
	App.renderApp();	
  }
  
  //const showWalletDefinitions = () => {
	//if (enableSaveWallet) {
	  //enableSaveWallet = false;
	//{ else {
	  //enableSaveWallet = true;
	//}
	//console.log(GuiUtils.getValue('walletNameCreate'));
	//App.renderApp();
  //}
  
  const setInputType = () => {
	if (GuiUtils.getChecked('radioMnemonic')) {
	  importType = "mnemonic";
	} else {
	  importType = "privateKey";
	}
	App.renderApp();
  }
  
  const toggleWalletName = () => {
	if (GuiUtils.getValue('walletNameCreate') !== "") {
	  enableSaveWallet = true;
	} else {
	  enableSaveWallet = false;
	}
	App.renderApp();
  }
  
  return (

  <div id="loginMnemonic">
  <div className="login-div ">
   <Banner App={App} GuiToggles={GuiToggles} page="loginMnemonic"/>
   <Menu App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} page="loginMnemonic"/>
   <header>
     <nav id="loginMnemonicMenuOpen" title="menu" onClick={(e) => showMenu()}>
       <img src="artwork/nav.svg" className="nav-icon dark-hover" onClick={(e) => showMenu()}/>
     </nav>
   </header>
    <img className="landingBack scale-hover" src="artwork/voting-back.svg"  height="38px" width="38px" onClick={(e)=> GuiToggles.showLanding()}/>
    <img className="logoTop"src="artwork/logonew.svg" height="80px" width="240px" />    
	<p className="address-text-ab font_size24 margin_none display_inline_block gradient-font">Import wallet ({(importType === "mnemonic") ? "Mnemonic" : "Private Key"})</p>
	
    <textarea tabIndex="1" style={(importType === "mnemonic") ? {display: 'block'} : {display: 'none'}} className="qraddress-div-ab color_white textarea-placeholder padding_5px" type="text" rows="2" cols="50" id="mnemonic" placeholder="Enter 12 word mnemonic/seed phrase"></textarea>
	<textarea tabIndex="2" style={(importType === "mnemonic") ? {display: 'none'} : {display: 'block'}} className="qraddress-div-ab color_white textarea-placeholder padding_5px" type="text" rows="2" cols="50" id="privateKeyElt" placeholder="Enter Private Key"></textarea>
	
	<input tabIndex="4" className="radioMnemonic" type="radio" id="radioMnemonic" name="importType" value="mnemonic" onChange={(e)=> setInputType()} defaultChecked/>
	<label className="radioMnemonicLabel gradient-font">Mnemonic</label>
	<input tabIndex="5" className="radioPrivateKey" type="radio" id="radioPrivateKey" name="importType" value="privateKey" onChange={(e)=> setInputType()}/>
	<label className="radioPrivateKeyLabel gradient-font">Private Key</label>
	
	{/*<input type="checkbox" className="saveWalletCheckbox" id="saveWallet" name="saveWallet" defaultChecked onChange={(e)=> showWalletDefinitions()}/><span className="saveWalletLabel">Save Wallet locally</span>*/}
	<input tabIndex="6" type="text" tabIndex="1" className="walletNameCreate" size="18" id="walletNameCreate" placeholder="Enter Wallet name" name="walletNameCreate" onChange={(e) => toggleWalletName()}/>
	<div style={enableSaveWallet ? {display: 'block'} : {display: 'none'}}>
	  <input tabIndex="7" type="password" className="enterPassword newPassword" size="18" id="newPassword" placeholder="Enter Password" name="newPassword"/>
	  <input tabIndex="8" type="password" className="enterPassword confirmPassword" size="18" id="confirmPassword" placeholder="Confirm Password" name="confirmPassword"/>
    </div>
	
	<div style={(importType === "mnemonic") ? {display: 'block'} : {display: 'none'}} className="flex_center">
	<input tabIndex="3" type="password" className="enterPassword passphrase" size="18" id="passphrase" placeholder="Passphrase (optional)" name="passphrase"/>
	<input type="text" size="18" maxLength={18} className="derivationPathPicker mnemonicPicker w195px" id="derivationPathMnemonic" name="derivationPathMnemonic" readOnly={!editablePath ? true : false} placeholder="Derivation path (default)"/><img title="For Advanced users only" className={!editablePath ? "editPath dark-hover padding_5px br5 editOn" : "editPath dark-hover padding_5px br5 editOff"} onClick={(e) => editPath()}/>
	</div>
    <div className="flex_center">
	  <button tabIndex="9" className="proceed-btn login-btn scale-hover" onClick={(e)=> useProceedButton()}>
        <p>Proceed</p>
      </button>	
    </div>
  <div className="tips">  
    <p className="gradient-font font_size20 ta_center list-none" >Tips</p>
    <ul style={(importType === "mnemonic") ? {display: 'block'} : {display: 'none'}} className="color_white ta_left">
      <li>Enter your 12 word mnemonic phrase above.</li>
      <li>Use a single space between each word, with no space before the first and last word.</li>
      <li>All words should be in lowercase.</li>
      <li>Take precautions when entering your mnemonic phrase, make sure no one is watching physically or virtually.</li>
    </ul>
	<ul style={(importType === "privateKey") ? {display: 'block'} : {display: 'none'}} className="color_white ta_left">
    <li>Enter your Private Key above.</li>
    <li>Your Private Key is a string of numbers and letters.</li>
    <li>Please use the Mnemonic login if you have your 12 seed words.</li>
    <li>Please take precautions when entering your Private Key, make sure nobody is watching you physically or virtually.</li>
  </ul>
  </div>
  </div>
</div>);
}

//   (
//   <table id="loginMnemonic" className="bordered w750h520px">
//     <tbody>
//       <tr>
//         <td colSpan="2">
//           <div>Mnemonic</div>
//         </td>
//       </tr>
//       <tr>
//         <td colSpan="2">
//           <textarea className="monospace" type="text" rows="4" cols="50" id="mnemonic" placeholder="Mnemonic"></textarea>
//         </td>
//       </tr>
//       <tr>
//         <td className="ta_left">
//           <div className="bordered bgcolor_black_hover display_inline_block" onClick={(e)=> useMnemonic()}>Use Mnemonic</div>
//         </td>
//         <td className="ta_right">
//           <div className="bordered bgcolor_black_hover display_inline_block" onClick={(e)=> GuiToggles.showLanding()}>Back</div>
//         </td>
//       </tr>
//     </tbody>
//   </table>
//   );
// }
