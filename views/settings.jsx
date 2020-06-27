const React = require('react');
const Banner = require('./partial/banner.jsx');

module.exports = (props) => {
  const App = props.App;
  const GuiToggles = props.GuiToggles;
  const exitPage = () => {
	if (App.getLoggedIn()) {
      GuiToggles.showHome();
	} else {
	  GuiToggles.showLanding();
	}
  }
  return (<div id="settings">
    <div className="qrmain-div">
    <Banner App={App} GuiToggles={GuiToggles} page="settings"/>
      <div className="flex w100pct">
      <img className="flex1 scale-hover" src="artwork/voting-back.svg" height="38px" width="38px" onClick={(e) => exitPage()}/>
      <p className="address-text font_size24 margin_none color_white display_inline_block">Settings</p>
      <div className="flex1"></div>
      </div>
    </div>
  </div>);
}
