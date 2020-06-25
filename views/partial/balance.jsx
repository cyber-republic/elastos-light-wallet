const React = require('react');

let showBalance = false;

module.exports = (props) => {
  const App = props.App;
  
  const balanceVisibility = () => {
	if (showBalance) {
	  showBalance = false;
	} else {
	  showBalance = true;
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
