const React = require('react');
const electron = require('electron');
let walletInfo;

module.exports = (props) => {
  const App = props.App;
  const GuiToggles = props.GuiToggles;
  const openDevTools = props.openDevTools;
  const page = props.page;
  const remote = electron.remote;
  const menuLoggedIn = App.getLoggedIn();
  const menuLedgerConnected = App.isLedgerConnected();
  const menuPasswordFlag = App.getPasswordFlag();
  
  const Version = () => {
    return remote.app.getVersion();
  }
  
  if (!menuLoggedIn) {
    walletInfo = "Not Logged In"
  } else {
    if (menuLedgerConnected) {
      walletInfo = "Ledger Device"
    } else if (menuPasswordFlag) {
      walletInfo = App.getWalletNameLogin();
      if (walletInfo.length === 0) walletInfo = App.getWalletNameCreate();
    } else {
      walletInfo = "One-time Access";
    }
  }

  const hideMenu = () => {
    GuiToggles.hideMenu(page);
  }
  
  const showSettings = () => {
    GuiToggles.showSettings(); 
  }

  return (
    <div id={page+'Menu'}>
      <div className="display_inline_block gradient-font marginleft_25px"><Version/> </div>
      <div className="display_inline_block">Active Node:</div>
      <div className="display_inline_block menu-change-div">        
        <input className="display_inline menu-change-input" type="text" size="20" id="nodeURL" style={{background: "inherit"}} placeholder={App.getRestService()} readOnly={true} />
      </div>
      <div className="display_inline_block">Wallet: <span className="m5L m10R gradient-font">{walletInfo}</span></div>
      <div className="padding_5px display_inline dark-hover br10 cursor_def" title="Dev Tools" onClick={(e) => openDevTools()}>Dev Tools</div>
      <img src="artwork/settings.png" className="scale-hover menu-settings" title="Settings" onClick={(e) => showSettings()}/>
      <div id={page+'MenuClose'} className="padding_5px display_inline dark-hover br10 marginright_20px" title="Close" onClick={(e) => hideMenu()}>
        <img src="artwork/menuclose.svg" />
      </div>
    </div>
  );
}
