const React = require('react');

module.exports = (props) => {
  const App = props.App;
  let showBalance = App.getCurrentShowBalance();
  
  const balanceVisibility = () => {  
  if (showBalance) {
    App.setShowBalance(false);
    //showBalance = false;
  } else {
    App.setShowBalance(true);
  }
  App.renderApp();
  }
  
  return (
      <div id="balance" className="pricearea">
      <img title={!showBalance ? "Show balance" : "Hide balance"} className={!showBalance ? "balanceEye eyeOn" : "balanceEye eyeOff"} onClick={(e) => balanceVisibility()}/>
    <p className="balance">balance</p>
        <p className="usd-head">USD</p>
        <p className={showBalance ? "usd-balance" : "usd-balance-hidden"}>{showBalance ? App.getUSDBalance() : "*****"}</p>
        <p className="ela-balance gradient-font">{showBalance ? App.getELABalance() : <span className="ela-balance-hidden">*****</span>} ELA</p>
      </div>

  )
}
