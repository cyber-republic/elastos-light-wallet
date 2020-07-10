const React = require('react');
const Menu = require('./partial/menu.jsx');
const Banner = require('./partial/banner.jsx');
const GuiUtils = require('../scripts/GuiUtils.js');

module.exports = (props) => {
  const App = props.App;
  const openDevTools = props.openDevTools;
  const GuiToggles = props.GuiToggles;
  const regenerate = () => {
    App.generateMnemonic();
    App.renderApp();
  }
  
  const showMenu = () => {
    GuiToggles.showMenu('create');
  }
  
  const CreateScreen = () => {
    if (App.getCreateScreen() === "create") {
      return (<ScreenCreate/>)
    }
    if (App.getCreateScreen() === "export") {
      return (<ScreenExport/>)
    }
  }
  
  
  const ScreenCreate = () => {
    return (
  <div id="create" className="import-div">
    <div className="flex_center w100pct">
      <img className="flex1 scale-hover" src="artwork/voting-back.svg" height="38px" width="38px" onClick={(e)=> GuiToggles.showLanding()}/>
      <img src="artwork/logonew.svg" height="80px" width="240px" />
      <div className="flex1"></div>
    </div>
    <p className="address-text font_size24 margin_none display_inline_block gradient-font">New Mnemonic phrase</p>
    <div className="qraddress-div bordered">
      <p className="address-ex display_inline_block font_size20 padding_5px" onClick={App.getDevelopMode() ? (e) => App.copyMnemonicToClipboard() : undefined}>{App.getGeneratedMnemonic()}</p>
    </div>
    <div className="flex_center">
      <button className="proceed-btn scale-hover" onClick={(e) => GuiToggles.showImport()}>
        <p>Next</p>
      </button>
    </div>
  
    <div>
      <p className="gradient-font font_size20 ta_center list-none" >Tips</p>
      <ul className="color_white ta_left">
        <li className="color_red font_size16">On a piece of paper, write down this mnemonic phrase in the exact same order it appears.</li>
        <li className="color_red font_size16">If you lose this mnemonic phrase, there will be no way to recover your coins.</li>
        <li>Make sure to keep a backup of the mnemonic it in a safe place that only you can access.</li>
        <li>Once you have written it down correctly, login to your wallet using these mnemonics.</li>
      </ul>
    </div>
  </div>);
  }
  
  const ScreenExport = () => {
    return (
  <div id="export" className="import-div">
    <div className="flex_center w100pct">
      <img className="flex1 scale-hover" src="artwork/voting-back.svg" height="38px" width="38px" onClick={(e)=> GuiToggles.showHome()}/>
      <img src="artwork/logonew.svg" height="80px" width="240px" />
      <div className="flex1"></div>
    </div>
    <p className="address-text font_size24 margin_none display_inline_block gradient-font">Your wallet ({App.getWalletNameLogin()}) mnemonic phrase</p>
    <div className="qraddress-div bordered">
      <p className="address-ex display_inline_block font_size20 padding_5px">{App.getMnemonicExport()}</p>
    </div>
    <div style={(App.getDerivationPathExport() > 0) ? {display: 'inline'} : {display: 'none'}} className="exportMnemonicDiv bordered">
      <p className="font_size16">Derivation path: m/44'/0'/0'/0/{App.getDerivationPathExport()}</p>
    </div>
    <div style={App.getPassphraseFlag() ? {display: 'inline'} : {display: 'none'}} className="exportMnemonicDiv bordered">
      <p className="display_inline_block">Passphrase is required with this mnemonic phrase, please make sure you have it written down or remember it.</p>
    </div>
    <div className="flex_center">
      <button className="proceed-btn scale-hover" onClick={(e) => GuiToggles.showHome()}>
        <p>Back</p>
      </button>
    </div>
  
    {/*<div>
      <p className="gradient-font font_size20 ta_center list-none" >Tips</p>
      <ul className="color_white ta_left">
        <li className="color_red font_size16">On a piece of paper, write down this mnemonic phrase in the exact same order it appears.</li>
        <li className="color_red font_size16">If you lose this mnemonic phrase, there will be no way to recover your coins.</li>
        <li>Make sure to keep a backup of the mnemonic it in a safe place that only you can access.</li>
      </ul>
    </div>*/}
  </div>
    );
  }
  
  return (
<div id="create">
  <Banner App={App} GuiToggles={GuiToggles} page="create"/>
  <Menu App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} page="create"/>
  <header>
    <nav id="createMenuOpen" title="menu" onClick={(e) => showMenu()}>
      <img src="artwork/nav.svg" className="nav-icon dark-hover" onClick={(e) => showMenu()}/>
    </nav>
  </header>
  <CreateScreen/>
</div>);
}