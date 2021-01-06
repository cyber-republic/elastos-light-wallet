const React = require('react');

const Menu = require('./partial/menu.jsx');
const Banner = require('./partial/banner.jsx');
const Branding = require('./partial/branding.jsx');
const Balance = require('./partial/balance.jsx');
const News = require('./partial/news.jsx');
const Staking = require('./partial/staking.jsx');
const SocialMedia = require('./partial/social-media.jsx');
const UTXOsSelection = require('./partial/utxos.jsx');

let showPasswordModal = false;
let showPasswordToggle = false;
let showUTXOs = false;

module.exports = (props) => {
  const App = props.App;
  const openDevTools = props.openDevTools;
  const Version = props.Version;
  const GuiToggles = props.GuiToggles;
  const GuiUtils = props.GuiUtils;
  const onLinkClick = props.onLinkClick;
  const isLedgerConnected = App.isLedgerConnected();

  const showMenu = () => {
    GuiToggles.showMenu('voting');
  }

  const ProducerSelectionButtonText = (props) => {
    // mainConsole.log('INTERIM ProducerSelectionButtonText props', props);
    // mainConsole.log('INTERIM ProducerSelectionButtonText item', props.item);
    // mainConsole.log('INTERIM ProducerSelectionButtonText isCandidate', props.item.isCandidate);
    const item = props.item;
    const isCandidate = item.isCandidate;
    if (isCandidate) {
      return (<img src="artwork/check-square.svg" />)
    } else {
      return (<img src="artwork/square.svg" />)
    }
  }
  
  const sendVote = () => {
    let isSent = App.sendVoteTx();
    if (isSent) {
      clearPasswordFields();
      closeModal();      
    }
    App.clearUTXOsSelection();
    App.renderApp();
  }
  
  const showVoteModal = () => {
    let isValid = App.checkTransactionHistory();
    if (isValid) {
      showPasswordModal = true;
      GuiUtils.setFocus('votePassword');
      App.renderApp();
    }
  }
  
  const closeModal = () => {
    if (showPasswordModal || showUTXOs) {
      showPasswordModal = false;
      showUTXOs = false;
      App.renderApp();
    }
  }
  
  const showPassword = () => {
    if (showPasswordToggle) {
      showPasswordToggle = false;
    } else {
      showPasswordToggle = true;
    }
    App.renderApp();    
  }
  
  const exitPage = () => {
    clearPasswordFields();
    GuiToggles.showHome();
  }
  
  const clearPasswordFields = () => {
    showPasswordToggle = false;
    GuiUtils.setValue('votePassword', '');    
  }
  
  const UTXOSelection = (_txType) => {
    showUTXOs = true;
    App.renderApp();
  }
  
  const UTXOSelectionNext = () => {
    let isValid = App.validateUTXOsSelection();
    if (isValid) {
      closeModal();
      App.setCustomUTXOs(true);
      /*if (App.getPasswordFlag()) {
        showVoteModal();
      } else {
        sendVote();
      }*/
    }    
  }
  
  module.exports.showPasswordModal = showPasswordModal;
  module.exports.showUTXOs = showUTXOs;
  module.exports.closeModal = closeModal;
  module.exports.exitPage = exitPage;
  module.exports.UTXOSelection = UTXOSelection;

  return (
    <div id="voting" className="gridback-voting w1125h750px">
     <Banner App={App} GuiToggles={GuiToggles} page="voting"/>
     <Menu App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} page="voting"/>
      <div className="logo-info">
      <Branding onClick={(e) => GuiToggles.showHome()}/>
      <header>
        <img src="artwork/refreshicon.svg" className="refresh-icon" title="Refresh" onClick={(e) => App.requestBlockchainData(true)} />
        <nav id="votingMenuOpen" title="menu" onClick={(e) => showMenu()}>
          <img src="artwork/nav.svg" className="nav-icon dark-hover" onClick={(e) => showMenu()}/>
        </nav>
      </header>
      <div className="pricearea">
       <Balance App={App}/>
      </div>

      <div className="stakingarea">
       <Staking App={App} GuiToggles={GuiToggles}/>
      </div>


      <div id="scroll-radio">

      </div>

      <div>
        <News App={App} onLinkClick={onLinkClick}/>
      </div>

      </div>

      <div className="voting-row1">
        <div>
          <img src="artwork/voting-back.svg" className="scale-hover" width="33px" height="33px" onClick={(e) => exitPage()}/>
          <p className="display_inline_block votes-header">Votes</p>
          <p className="display_inline_block candidate-status status-font">Status: {App.getProducerListStatus()} </p>
          <p className="display_inline_block status-font">Candidates: {App.getParsedProducerList().producers.length} </p>
          <p className="display_inline_block status-font">Selected: {App.getParsedProducerList().producersCandidateCount}/{App.getMaxCandidates()} </p>
          </div>
      </div>

      <div className="voting-row2 overflow_auto scrollbar">
        <table className="w100pct no_border whitespace_nowrap txtable">
          <tbody>
            <tr className="txtable-headrow">
              <td className="no_border no_padding">#</td>
              <td className="no_border no_padding">Nickname</td>
              <td className="no_border no_padding">Active</td>
              <td className="no_border no_padding">Votes</td>
              <td className="no_border no_padding">Select</td>
            </tr>
            {
              App.getParsedProducerList().producers.map((item, index) => {
                return (<tr className={item.isCandidate ? 'txtable-row voting-selected ': 'txtable-row voting-hover'} key={index} onClick={(e) => App.toggleProducerSelection({index})}>
                  <td className="no_border no_padding">{item.n}</td>
                  <td className="no_border no_padding">{item.nickname}</td>
                  <td className="no_border no_padding">
                  {Number(item.active) ? (<img src="artwork/greenstatus.svg" />) : (<img src="artwork/redstatus.svg" />)
                  } </td>
                  <td className="no_border no_padding">{item.votes}</td>
                  <td className="white_on_purple_with_hover h20px fake_button">
                    <ProducerSelectionButtonText item={item}/>
                  </td>
                </tr>)
              })
            }
          </tbody>
        </table>
      </div>

      <div className="voting-row3">
        <button className='votingselect-button scale-hover' title="Select previous voting list" onClick={() => App.selectActiveVotes()} >Select Previous</button>
        <button className='votingselect-button marginright_auto scale-hover' title='Clear Selection' onClick={() => App.clearSelection()}>Clear Selection</button>
        <div style={App.getCustomUTXOs() ? {display: 'block'} : {display: 'none'}} className="utxo-custom-text-voting utxo-custom-text" title="Update selected UTXOs by CTRL+u or CMD+u">Selected UTXOs ({App.getSelectedUTXOs().length}/{App.getTotalUTXOs()})</div>
        <button onClick={App.getPasswordFlag() ? (e) => showVoteModal() : (e) => sendVote()} className="scale-hover voting-button">Vote</button>
      </div>

      <div className="voting-row4">
        <p className="display_inline_block active-heading">Active Votes</p>
        <p className="display_inline_block vote-status status-font">Status: {App.getCandidateVoteListStatus()} </p>
        <p className="display_inline_block status-font">Power: {App.getVoteValue()} </p>
        <p className="display_inline_block status-font">Voted {App.getParsedCandidateVoteList().candidateVotes.length}/{App.getMaxCandidates()}</p>
      </div>

      <div className="voting-row5 overflow_auto scrollbar">
        <table className="w100pct no_border whitespace_nowrap font_size16 txtable">
          <tbody>
            <tr className="txtable-headrow">
              <td className="no_border no_padding">#</td>
              <td className="no_border no_padding">Nickname</td>
              <td className="no_border no_padding">Voting power</td>
              <td className="no_border no_padding">State</td>
            </tr>
            {
              App.getParsedCandidateVoteList().candidateVotes.map((item, index) => {
                return (<tr className="txtable-row" key={index}>
                  <td className="no_border no_padding">{item.n}</td>
                  <td className="no_border no_padding">{item.nickname}</td>
                  <td className="no_border no_padding">{item.votes} ELA</td>
                  <td className="no_border no_padding">{item.state}</td>
                </tr>)
              })
            }
          </tbody>
        </table>
      </div>

      <div>
        <SocialMedia GuiToggles={GuiToggles}  onLinkClick={onLinkClick}/>
      </div>
      
      <div className="statusRequests" style={App.getDevelopMode() ? {display: 'flex'} : {display: 'none'}}>
        <button className="requestsButtons padding_5px display_inline dark-hover br10 cursor_def" onClick={(e) => App.listRequests()}>List requests</button>
        <button className="requestsButtons padding_5px display_inline dark-hover br10 cursor_def m15L" onClick={(e) => App.clearRequests()}>Clear requests</button>
      </div>
      
      <UTXOsSelection App={App} showUTXOs={showUTXOs} closeModal={closeModal} UTXOSelection={UTXOSelection} UTXOSelectionNext={UTXOSelectionNext}/>
      
      <div className="bg-modal w400px h200px" style={showPasswordModal ? {display: 'flex'} : {display: 'none'}}>
        <a onClick={(e) => closeModal()}></a>
        <div className="modalContent w350px h180px">
          <div className="closeModal" onClick={(e) => closeModal()}>
            <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
          </div>
          <div>
            <span className="address-text modal-title font_size20 gradient-font">Vote via wallet ({App.getWalletNameLogin()})</span>
          </div>
          <div className="m15T">
            <input type="password" className="enterPassword" type={showPasswordToggle ? "text" : "password"} size="18" id="votePassword" placeholder="Enter Password" name="votePassword"/>
            <img className={showPasswordToggle ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword()} />
          </div>
          <div className="m15T">
            <button className="submitModal scale-hover" onClick={(e) => sendVote()}>Confirm</button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
