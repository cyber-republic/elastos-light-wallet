const React = require('react');
const Menu = require('./partial/menu.jsx');
const Banner = require('./partial/banner.jsx');

let editablePath = false;
let derivationPathMnemonic = '';
let importType = "mnemonic";
let success = '';
let showPassphrase = false;
let showNewPassword = false;
let showConfirmPassword = false;
let showCreateWalletModal = false;
let passwordsComplexity = true;
let passwordsMatch = true;

module.exports = (props) => {
  const App = props.App;
  const openDevTools = props.openDevTools;
  const GuiToggles = props.GuiToggles;
  const GuiUtils = props.GuiUtils;
  
  const useProceedButton = (_saveWallet) => {
    if (importType === "mnemonic") {
      success = App.getPublicKeyFromMnemonic(_saveWallet);      
    } else {
      success = App.getPublicKeyFromPrivateKey(_saveWallet);      
    }  
    if(success) {
      clearPasswordFields();
      closeModal();
      editablePath = false;
      GuiToggles.showHome();
    }
  }
  
  const showMenu = () => {
    GuiToggles.showMenu('import');
  }
  
  const editPath = () => {
  if (!editablePath) {
    editablePath = true;
    GuiUtils.setValue('derivationPathMnemonic', "0");
  } else {
    editablePath = false;
    GuiUtils.setValue('derivationPathMnemonic', "");
  }
  App.renderApp();  
  }
  
  const validatePath = () => {
  derivationPathMnemonic = GuiUtils.getValue('derivationPathMnemonic');
    
    if (derivationPathMnemonic == "") {
      indexPathMnemonic = 0;
    } else {
      var pathArr = derivationPathMnemonic.split("/");
      var indexPathMnemonic = pathArr[pathArr.length-1];
    }
    if (!App.isValidDecimal(indexPathMnemonic)) {
      GuiUtils.setValue('derivationPathMnemonic', '');
      editablePath = false;
      App.renderApp();
    }
  }
    
  const setInputType = () => {
  if (GuiUtils.getChecked('radioMnemonic')) {
    importType = "mnemonic";
    GuiUtils.setValue('privateKeyElt','');
  } else {
    importType = "privateKey";
    GuiUtils.setValue('mnemonic','');
  }
  App.renderApp();
  }
  
  const showPassword = (event) => {
    var elementID = event.target.id;
    if (elementID === "passphraseEye") {
      if (showPassphrase) {
        showPassphrase = false;
      } else {
        showPassphrase = true;
      }      
    }  else if (elementID === "newPasswordEye") {
      if (showNewPassword) {
        showNewPassword = false;
      } else {
        showNewPassword = true;
      }      
    } else if (elementID === "confirmPasswordEye") {
      if (showConfirmPassword) {
        showConfirmPassword = false;
      } else {
        showConfirmPassword = true;
      }      
    }
    App.renderApp();    
  }
  
  const closeModal = () => {
    if (showCreateWalletModal) {
      showCreateWalletModal = false;
      App.renderApp();
    }
  }
  
  const showCreateWallet = () => {
    showCreateWalletModal = true;
    App.renderApp();
  }
  
  const comparePasswords = () => {
    if (App.getPasswordRegEx().test(GuiUtils.getValue('newPassword'))) {
      passwordsComplexity = true;
    } else {
      passwordsComplexity = false;
    }
      
    if (GuiUtils.getValue('newPassword') === GuiUtils.getValue('confirmPassword')) {
      passwordsMatch = true;
    } else {
      passwordsMatch = false;
    }
    App.renderApp();
  }
  
  const exitPage = () => {
    clearPasswordFields();
    editablePath = false;
    GuiToggles.showLanding();    
  }
  
  const clearPasswordFields = () => {
    showPassphrase = false;
    showNewPassword = false;
    showConfirmPassword = false;
    passwordsComplexity = true;
    passwordsMatch = true;  
  }
  
  module.exports.showCreateWalletModal = showCreateWalletModal;
  module.exports.closeModal = closeModal;
  module.exports.exitPage = exitPage;
  
  return (
<div id="import">
  <div className="import-div">
    <Banner App={App} GuiToggles={GuiToggles} page="import"/>
    <Menu App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} page="import"/>
    <header>
      <nav id="importMenuOpen" title="menu" onClick={(e) => showMenu()}>
        <img src="artwork/nav.svg" className="nav-icon dark-hover" onClick={(e) => showMenu()}/>
      </nav>
    </header>
    <div className="flex_center w100pct">
      <img className="flex1 scale-hover" src="artwork/voting-back.svg" height="38px" width="38px" onClick={(e)=> exitPage()}/>
      <img src="artwork/logonew.svg" height="80px" width="240px" />
      <div className="flex1"></div>
    </div>
    <p className="address-text font_size24 margin_none display_inline_block gradient-font">Import wallet ({(importType === "mnemonic") ? "Mnemonic" : "Private Key"})</p>
  
    <textarea tabIndex="1" style={(importType === "mnemonic") ? {display: 'block'} : {display: 'none'}} className="qraddress-div color_white textarea-placeholder padding_5px" type="text" rows="2" cols="50" id="mnemonic" placeholder="Enter 12 word mnemonic/seed phrase"></textarea>
    <textarea tabIndex="1" style={(importType === "mnemonic") ? {display: 'none'} : {display: 'block'}} className="qraddress-div color_white textarea-placeholder padding_5px" type="text" rows="2" cols="50" id="privateKeyElt" placeholder="Enter Private Key"></textarea>
    
    <div className="flex-middle">
      <input tabIndex="3" className="radioImport" type="radio" id="radioMnemonic" name="importType" value="mnemonic" onChange={(e)=> setInputType()} defaultChecked/>
      <label className="radioLabelImport gradient-font">Mnemonic</label>
      <input tabIndex="4" className="radioImport m50L" type="radio" id="radioPrivateKey" name="importType" value="privateKey" onChange={(e)=> setInputType()}/>
      <label className="radioLabelImport gradient-font">Private Key</label>
    </div>      
    <div style={(importType === "mnemonic") ? {display: 'flex'} : {display: 'none'}}>
      <input tabIndex="2" type={showPassphrase ? "text" : "password"} className="enterPassword passphrase" size="18" id="passphrase" placeholder="Passphrase (optional)" name="passphrase"/>
      <img id="passphraseEye" style={showCreateWalletModal ? {display: 'none'} : {display: 'block'}} className={showPassphrase ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
    </div>
  
    <div className="flex-middle w200px" style={(App.getCurrentAdvancedFeatures() && importType === "mnemonic") ? {display: 'flex'} : {display: 'none'}}>
      <span style={(editablePath) ? {display: 'flex'} : {display: 'none'}} className="derivationPathTextMnemonic">m/44'/0'/0'/0/</span>
      <input type="text" size="4" maxLength={4} className="derivationPathPicker mnemonicPicker w175px" id="derivationPathMnemonic" name="derivationPathMnemonic" readOnly={!editablePath ? true : false} placeholder="Derivation path (default)" onChange={(e) => validatePath()}/><img title="For Advanced users only" className={!editablePath ? "editPath dark-hover padding_5px br5 editOn" : "editPath dark-hover padding_5px br5 editOff"} onClick={(e) => editPath()}/>
    </div>
    <div className="flex_center">
      <button tabIndex="9" className="proceed-btn scale-hover" onClick={(e)=> showCreateWallet()}>
        <p>Proceed</p>
      </button>  
    </div>
    <div>  
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
        <li>Please use the Mnemonic import if you have your 12 seed words.</li>
        <li>Please take precautions when entering your Private Key, make sure nobody is watching you physically or virtually.</li>
      </ul>
    </div>
    <div className="bg-modal" style={showCreateWalletModal ? {display: 'flex'} : {display: 'none'}}>
      <a onClick={(e) => closeModal()}></a>
      <div className="modalContent w450px h300px">
        <div className="closeModal" onClick={(e) => closeModal()}>
          <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
        </div>
        <div>
          <span className="address-text modal-title gradient-font">Save wallet</span>
        </div>
        <div className="m15T">
          <input tabIndex="5" type="text" className="walletNameCreate" size="18" id="walletNameCreate" placeholder="Enter wallet name" name="walletNameCreate"/>
        </div>
        <div className="m15T">
          <input tabIndex="6" type={showNewPassword ? "text" : "password"} className="enterPassword w215px" size="18" id="newPassword" placeholder="Enter Password" name="newPassword" onChange={(e) => comparePasswords()}/>
          <img id="newPasswordEye" className={showNewPassword ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)} />
          <br /><span className={passwordsComplexity ? "infoText color_gray border_gray" : "infoText color_red border_red"}>Min. 8 characters, at least one uppercase, lowercase, number and special character</span>
        </div>
        <div className="m15T">
          <input tabIndex="7" type={showConfirmPassword ? "text" : "password"} className="enterPassword w215px" size="18" id="confirmPassword" placeholder="Confirm Password" name="confirmPassword" onChange={(e) => comparePasswords()}/>
          <img id="confirmPasswordEye" className={showConfirmPassword ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword(e)}/>
          <br /><span style={!passwordsMatch ? {display: 'inline-block'} : {display: 'none'}} className="infoText color_red border_red">Passwords do not match</span>
        </div>
        <div className="flex-middle m15T w100pct">          
          <button className="skipModal dark-hover" onClick={(e) => useProceedButton(false)}>Skip Save<img src="artwork/arrow.svg" alt="" className="arrow-forward"/></button>
          <button className="submitModal scale-hover m150L" onClick={(e) => useProceedButton(true)}>Save</button>
        </div>      
      </div>
    </div>
  </div>
</div>);
}