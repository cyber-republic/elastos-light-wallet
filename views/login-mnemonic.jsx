const React = require('react');

const Menu = require('./partial/menu.jsx');

const Banner = require('./partial/banner.jsx');

const GuiUtils = require('../scripts/GuiUtils.js');

let editablePath = false;

module.exports = (props) => {
  const App = props.App;
  const openDevTools = props.openDevTools;
  const GuiToggles = props.GuiToggles;
  const useMnemonic = () => {
    const success = App.getPublicKeyFromMnemonic();
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
    <div className="flex_center w100pct">
    <img className="flex1 scale-hover" src="artwork/voting-back.svg"  height="38px" width="38px" onClick={(e)=> GuiToggles.showLanding()}/>
    <img src="artwork/logonew.svg" height="80px" width="240px" />
    <div className="flex1"></div>
    </div>
    <p className="address-text font_size24 margin_none display_inline_block gradient-font">Enter Mnemonics</p>
    <textarea className="qraddress-div color_white textarea-placeholder padding_5px" type="text" rows="4" cols="50" id="mnemonic" placeholder="Enter 12 word mnemonic/seed phrase" onClick={(e) => App.pasteMnemonicFromClipboard()}></textarea>
    <div className="flex_center">
	<input type="text" size="18" maxLength={18} className="derivationPathPicker mnemonicPicker w195px" id="derivationPathMnemonic" name="derivationPathMnemonic" readOnly={!editablePath ? true : false} placeholder="Derivation path (default)"/><img title="For Advanced users only" className={!editablePath ? "editPath dark-hover padding_5px br5 editOn" : "editPath dark-hover padding_5px br5 editOff"} onClick={(e) => editPath()}/>
      
	  {/*<input id="indexPathMnemonic" name="indexPathMnemonic" onChange={(e) => App.changeIndexPathMnemonic()}>
	  <option value="0">Derivation path (default)</option>
	  <option value="1">m/44'/0'/0'/0/1</option>
	  <option value="2">m/44'/0'/0'/0/2</option>
	  <option value="3">m/44'/0'/0'/0/3</option>
	  <option value="4">m/44'/0'/0'/0/4</option>
	  <option value="5">m/44'/0'/0'/0/5</option>
	  <option value="6">m/44'/0'/0'/0/6</option>
	  <option value="7">m/44'/0'/0'/0/7</option>
	  <option value="8">m/44'/0'/0'/0/8</option>
	  <option value="9">m/44'/0'/0'/0/9</option>	  
	  </select>*/}
	</div>
    <div className="flex_center">
	  <button className="proceed-btn scale-hover" onClick={(e)=> useMnemonic()}>
        <p>Proceed</p>
      </button>
	
    </div>

  <div>
  <p className="gradient-font font_size20 ta_center list-none" >Tips</p>
  <ul className="color_white ta_left">
    <li>Enter your 12 word mnemonic phrase above.</li>
    <li>Use a single space between each word, with no space before the first and last word.</li>
    <li>All words should be in lowercase.</li>
    <li>Take precautions when entering your mnemonic phrase, make sure no one is watching physically or virtually.</li>
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
