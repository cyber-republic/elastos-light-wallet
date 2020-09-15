const React = require('react');
const GuiUtils = require('../../scripts/GuiUtils.js');

module.exports = (props) => {
  const App = props.App;
  let showBalance = App.getCurrentShowBalance();
  
  const balanceVisibility = () => {
    if (showBalance) {      
      App.setCurrentShowBalance(false);
      GuiUtils.setChecked('userShowBalance', false);
    } else {
      App.setCurrentShowBalance(true);
      GuiUtils.setChecked('userShowBalance', true);
    }
    App.renderApp();
  }
  
  return (
      <div id="balance" className="pricearea">
      <img title={!showBalance ? "Show balance" : "Hide balance"} className={!showBalance ? "balanceEye eyeOn" : "balanceEye eyeOff"} onClick={(e) => balanceVisibility()}/>
    <p className="balance">balance</p>
        <p className="currency-head">{App.getCurrentCurrency().toUpperCase()}</p>
        <p className={showBalance ? "currency-balance" : "currency-balance-hidden"}>{showBalance ? App.getCurrencyBalance() : "*****"}</p>
        <p className="ela-balance gradient-font">{showBalance ? App.getELABalance() : <span className="ela-balance-hidden">*****</span>} ELA</p>
      </div>

  )
}
