const React = require('react');

const QRCode = require('qrcode.react');
const Menu = require('./partial/menu.jsx');
const Banner = require('./partial/banner.jsx');
const Branding = require('./partial/branding.jsx');
const Balance = require('./partial/balance.jsx');
const News = require('./partial/news.jsx');
const Staking = require('./partial/staking.jsx');
const SocialMedia = require('./partial/social-media.jsx');
const UTXOsSelection = require('./partial/utxos.jsx');

let consolidesCount = 0;
let showPasswordModal = false;
let showPasswordToggle = false;
let sendTxType = false;
let consolidateTxType = false;
let isSent = false;
let showTxDetails = false;
let showUTXOs = false;
let txDetail = '';
let txModalTop = 0;
let autoFocus = 0;
let modalTitle = '';
let memoFocused = false;

module.exports = (props) => {
  const App = props.App;
  const openDevTools = props.openDevTools;
  const Version = props.Version;
  const GuiToggles = props.GuiToggles;
  const GuiUtils = props.GuiUtils;
  const onLinkClick = props.onLinkClick;
  const isLedgerConnected = App.isLedgerConnected();
  consolidesCount = Math.ceil(Number(App.getTotalUTXOs())/Number(App.getMaxUTXOsPerTX()));
  let consolidateTitle = "Total number of UTXOs is "+App.getTotalUTXOs()+".\nYou can consolidate UTXOs up to "+consolidesCount+" times (max "+App.getMaxUTXOsPerTX()+" per Tx).";
  
  const showMenu = () => {
    GuiToggles.showMenu('home');
  }
  
  const autoFocusOn = (e) => {
    if (e.target.id === "sendToAddress") autoFocus = 1;
    if (e.target.id === "sendAmount") autoFocus = 2;
    if (e.target.id === "feeAmount") autoFocus = 3;
    if (e.target.id === "txMemo") autoFocus = 4;
  }
  
  const autoFocusOff = () => {
    autoFocus = 0;
  }
  
  const writeSendData = () => {
    App.writeSendData();
  }

  const showConfirmAndSeeFees = () => {
    let isValid = App.validateInputs();
    if (isValid) {
      App.setSendStep(2);
    }
    App.renderApp();
  }

  const cancelSend = () => {
    App.setSendStep(1);
    App.renderApp();
  }

  const sendAmountToAddress = () => {
    let isSent = App.sendAmountToAddress();
    if (isSent) {
      closeModal();      
    }
    App.renderApp();
  }
  
  const consolidateUTXOs = () => {
    isSent = App.consolidateUTXOs();
    if (isSent) {
      closeModal();      
    }
    App.renderApp();
  }

  const SendScreen = (props) => {
    // App.log('SendScreen', App.getSendStep());
    if (App.getSendStep() == 1) {
      return (<div>
        <SendScreenOne visibility=""/>
        <SendScreenTwo visibility="display_none"/>
      </div>)
    }
    if (App.getSendStep() == 2) {
      return (<div>
        <SendScreenOne visibility="display_none"/>
        <SendScreenTwo visibility=""/>
      </div>)
    }
  }
  
  const showSendModal = () => {
    modalTitle = "Send from wallet ("+App.getWalletNameLogin()+")";
    showPasswordModal = true;
    sendTxType = true;
    consolidateTxType = false;
    GuiUtils.setFocus('sendPassword');
    App.renderApp();
  }
  
  const showConsolidateModal = () => {
    let isValid = App.checkTransactionHistory();
    if (isValid) {
      modalTitle = "Consolidate wallet ("+App.getWalletNameLogin()+")";
      showPasswordModal = true;
      sendTxType = false;
      consolidateTxType = true;
      GuiUtils.setFocus('sendPassword');
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
  
  const loadMoreTx = () => {
    var txRecordCount = App.getTxRecordsCount()+App.getInitTxRecordsCount();
    App.setTxRecordsCount(txRecordCount);
    App.renderApp();
  }
  
  const retrieveCryptoName = () => {
    App.retrieveCryptoName();    
  }
  
  const offset = (el) => {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
  }
  
  const showTXDetail = (_txID, event) => {
    txDetail = App.getTXDetails(_txID);
    showTxDetails = true;
    
    txModalTop = offset(event.target).top-357;
    App.renderApp();
  }
  
  const hideTXDetail = () => {
    showTxDetails = false;
    App.renderApp();
  }
  
  const UTXOControl = () => {
    showUTXOs = true;
    App.renderApp();
  }
  
  const UTXOControlNext = () => {
    let isValid = App.validateUTXOsSelection();
    if (isValid) {
      closeModal();
      if (App.getSelectedUTXOs().length > 0) {
        App.setCustomUTXOs(true);
      } else {
        App.setCustomUTXOs(false);
      }
    }    
  }
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      retrieveCryptoName();
    }
  }
  
  const resetPage = () => {
    if (GuiUtils.getValue('sendToAddress') !== "" || GuiUtils.getValue('sendAmount') !== "") {
        showPasswordToggle = false;
        App.clearSendData();
        App.renderApp();
    }
  }
  
  const memoFocus = () => {
    memoFocused = true;
    //console.log("memoFocus", memoFocused);
    App.renderApp();
  }
  
  const memoFocusOff = () => {
    memoFocused = false;
    autoFocusOff();
    //console.log("memoFocusOff", memoFocused);
    App.renderApp();
  }
    
  module.exports.showPasswordModal = showPasswordModal;
  module.exports.showUTXOs = showUTXOs;
  module.exports.closeModal = closeModal;
  module.exports.resetPage = resetPage;
  module.exports.cancelSend = cancelSend;
  module.exports.UTXOControl = UTXOControl;
  
  const SendScreenOne = (props) => {
    const visibility = props.visibility;
    return (<div id="sendOne" className={`send-area ${visibility}`}>
      <img src="artwork/sendicon.svg" className="send-icon"/>
      <p className="send-text">Send</p>
      <input tabIndex="1" type="text" size="34" maxLength={34} id="sendToAddress" className="ela-address_input" placeholder="Enter ELA Address or CryptoName" defaultValue={App.getSendToAddress()} onChange={(e) => writeSendData()} onKeyDown={(e) => handleKeyDown(e)} onFocus={(e) => autoFocusOn(e)} onBlur={(e) => autoFocusOff()} autoFocus={autoFocus === 1 ? true : false}/>
      <img className="cryptoname" title="Click to retrieve ELA address from cryptoname.org or press Enter" onClick={(e) => retrieveCryptoName()}/>
      <input tabIndex="2" type="text" size="14" maxLength={14} id="sendAmount" className="ela-send_amount" placeholder="Amount" defaultValue={App.getSendAmount()} onChange={(e) => writeSendData()} onFocus={(e) => autoFocusOn(e)} onBlur={(e) => autoFocusOff()} autoFocus={autoFocus === 2 ? true : false}/>    
    <div className="quick-elaselector">
      <button className="quick-elaselector-icon quarter" onClick={() => App.insertELA('quarter')}>25%</button>
      <button className="quick-elaselector-icon half" onClick={() => App.insertELA('half')}>50%</button>
      <button className="quick-elaselector-icon max" onClick={() => App.insertELA('max')}>Max</button>
    </div>
    <hr className="ela-send_amount_line" />
    <p className="elatext-send">ELA</p>
    <input tabIndex="3" type="text" size="5" maxLength={5} id="feeAmount" placeholder="Fees (SELA)" style={!memoFocused ? {display: 'block'} : {display: 'none'}} defaultValue={App.getFee()} onChange={(e) => writeSendData()} onFocus={(e) => autoFocusOn(e)} onBlur={(e) => autoFocusOff()} autoFocus={autoFocus === 3 ? true : false}/>
    {/*<div className="fees-text">Fees (in Satoshi ELA)</div>*/}
    <input tabIndex="4" type="text" maxLength={128} id="txMemo" placeholder="Memo" className={memoFocused ? "memo-field focused" : "memo-field not-focused"} defaultValue={App.getTxMemo()} onChange={(e) => writeSendData()} onFocus={(e) => autoFocusOn(e)} onClick={(e) => memoFocus()} onBlur={(e) => memoFocusOff()} autoFocus={autoFocus === 4 ? true : false}/>
    <button tabIndex="5" className="next-button scale-hover" onClick={(e) => showConfirmAndSeeFees()}><p>Next</p></button>
    <button tabIndex="6" style={App.showConsolidateButton() ? {display: 'block'} : {display: 'none'}} className="consolidate-button dark-hover cursor_def" title={consolidateTitle} onClick={(App.getPasswordFlag()) ? (e) => showConsolidateModal() : (e) => consolidateUTXOs()}>Consolidate ({consolidesCount})<img src="artwork/arrow.svg" alt="" className="arrow-forward"/></button>
    </div>);
  }

  const SendScreenTwo = (props) => {
    const visibility = props.visibility;
    return (
      <div id="sendTwo" className={`send-area ${visibility}`}>
        <img src="artwork/sendicon.svg" className="send-icon" title="Refresh Blockchain Data" onClick={(e) => App.requestBlockchainData(true)}/>
        <p className="send-text">Send</p>
        <p className="confirm-send-address-label">Receiving Address</p>
        <p className="confirm-send address"><span>{App.getSendToAddress()}</span></p>
        <p className="confirm-send total maxheight">Total spending amount with fees is <span>{App.getTotalSpendingELA()} ELA</span>{App.getTxMemo() !== '' ? " and memo " : ""}<span className={App.getTxMemo().length > 55 ? "confirm-memo-long" : ""} title={App.getTxMemo()}>{App.getTxMemo() !== '' ? App.getTxMemo(true) : ""}</span></p>
        <button className="send-back dark-hover cursor_def" onClick={(e) => cancelSend()}><img src="artwork/arrow.svg" alt="" className="rotate_180 arrow-back" /><span className="send-back-text">Back</span></button>        
        <button className="sendela-button scale-hover" onClick={(App.getPasswordFlag()) ? (e) => showSendModal() : (e) => sendAmountToAddress()}><p>Send ELA</p></button>        
      </div>
    )
  }

  return (
  <div id="home" className="gridback w1125h750px">
    <Banner App={App} GuiToggles={GuiToggles} page="home"/>
    <Menu App={App} openDevTools={openDevTools} GuiToggles={GuiToggles} page="home"/>
    <div id="version" className="display_inline_block hidden">
      <Version/>
    </div>
    <div className="logo-info">
      <Branding/>
      <header>
        <img src="artwork/refreshicon.svg" className="refresh-icon" title="Refresh" onClick={(e) => App.requestBlockchainData(true)} />
        <nav id="homeMenuOpen" title="Menu" onClick={(e) => showMenu()}>
          <img src="artwork/nav.svg" className="nav-icon dark-hover" onClick={(e) => showMenu()}/>
        </nav>
      </header>
      <div className="pricearea">
        <Balance App={App}/>
      </div>

      <div className="stakingarea">
        <Staking App={App} GuiToggles={GuiToggles}/>
      </div>

      <div id="scroll-radio"></div>

      <div>
        <News App={App} onLinkClick={onLinkClick}/>
      </div>

    </div>

    <div className="send-area">
      <SendScreen/>

    </div>

    <div className="receive-area">
      <img src="artwork/sendicon.svg" className="rec-icon"/>
      <p className="rec-text">Receive</p>
      <p className="address-text address-position">Address</p>
      <button className="copy-button scale-hover" onClick={(e) => App.copyAddressToClipboard()}>
        <img src="artwork/copycut.svg" className="copy-icon" height="20px" width="20px"/>
      </button>
      <p className="address-ex word-breakall">{App.getAddress()}</p>
      <button className="qr-icon btn_none br5" title="Click to enlarge" onClick={(e) => GuiToggles.showQRCode()}>
        <QRCode value={App.getAddressOrBlank()} size={78} includeMargin={true} className="scale-hover"/>
      </button>
      <p className="scanqr-text">Scan
        <strong> QR code </strong>
        to get
        <br/>ELA Address</p>
      <p className="howqr-text gradient-font">Click QR code to Enlarge</p>
      <img src="artwork/separator.svg" className="rec-separator"/>
      <p className="ledger-heading">Ledger</p>
      {isLedgerConnected && <img src="artwork/ledgericon.svg" alt="" className="ledger-icon scale-hover" height="36px" width="57px" title="Please verify above address on Ledger" onClick={(e) => App.verifyLedgerBanner()}/>}
      {isLedgerConnected && <p className="verifyledger-text">Please verify above address<br/><strong>on Ledger Device</strong></p>}
      {!isLedgerConnected && <img src="artwork/ledgericon.svg" alt="" className="ledger-icon scale-hover" height="36px" width="57px" title="No Ledger device connected"/>}
      {!isLedgerConnected && <p className="verifyledger-text">No Ledger device<br/><strong>connected</strong></p>}
    </div>

    <div className="transaction-area">
      <p className="transactions-heading">Transactions</p>
      <p className="blockcount transactionstatus">
        <span>Status: </span>
        <span>{App.getTransactionHistoryStatus()}</span>
      </p>
      <p className="blockcount">
        <span>Blocks: </span>
        <span>{App.getBlockchainState().height}</span>
      </p>

      <div className="txtablediv scrollbar">

        <table className="txtable">
          <tbody>
            <tr className="txtable-headrow">
              <td>VALUE</td>
              <td>DATE</td>
              <td>TYPE</td>
              <td>TX</td>
              <td>MEMO</td>
            </tr>

            {
              App.getParsedTransactionHistory().slice(0, App.getTxRecordsCount()).map((item, index) => {
                return (<tr className="txtable-row w684px" key={index}>
                  <td>{item.valueShort}&nbsp;<span className="dark-font">ELA</span>
                  </td>
                  <td>{item.date}&nbsp;&nbsp;<span className="dark-font">{item.time}</span>
                  </td>
                  <td className={(item.status === "pending") ? "tx-pending" : "" }>{item.type}</td>
                  <td>
                    <a className="exit_link" href={item.txDetailsUrl} onClick={(e) => onLinkClick(e)}>{item.txHashWithEllipsis}</a>
                  </td>
                  <td>
                    <span className="tx-memo">{item.memo}</span>
                  </td>
                  <td className="w35px">
                    <img id={"txDetailIcon_"+index}className="txDetail dark-hover padding_5px br5" onMouseEnter={(e) => showTXDetail(item.txHash, e)} onMouseOut={(e) => hideTXDetail()}/>
                  </td>
                </tr>)
              })
            }

          </tbody>
        </table>
        <div className="flex-middle" style={(App.getParsedTransactionHistory().length > App.getInitTxRecordsCount()) ? {display: 'flex'} : {display: 'none'}}>
          <button className="history-button dark-hover m10B" onClick={(e) => loadMoreTx()}><img src="artwork/arrow.svg" alt="" className="rotate_90 arrow-history"/></button>
        </div>
      </div>

      <div>
        <SocialMedia GuiToggles={GuiToggles} onLinkClick={onLinkClick}/>
      </div>    
    </div>
    
    <div className="statusRequests" style={App.getDevelopMode() ? {display: 'flex'} : {display: 'none'}}>
      <button className="requestsButtons padding_5px display_inline dark-hover br10 cursor_def" onClick={(e) => App.listRequests()}>List requests</button>
      <button className="requestsButtons padding_5px display_inline dark-hover br10 cursor_def m15L" onClick={(e) => App.clearRequests()}>Clear requests</button>
    </div>
    
    <button tabIndex="7" style={(App.getCurrentAdvancedFeatures() || App.getCustomUTXOs()) ? {display: 'block'} : {display: 'none'}} className={App.getCustomUTXOs() ? "utxo-control-button utxo-custom-text-home utxo-custom-text dark-hover cursor_def" : "utxo-control-button utxo-custom-text-home utxo-custom-text-grey dark-hover cursor_def"} title="Update selected UTXOs by CTRL+u or CMD+u" onClick={(e) => UTXOControl()}>UTXO Control ({App.getCustomUTXOs() ? App.getSelectedUTXOs().length+"/"+App.getTotalUTXOs() : "ALL"} selected)</button>
    <UTXOsSelection App={App} showUTXOs={showUTXOs} closeModal={closeModal} UTXOControl={UTXOControl} UTXOControlNext={UTXOControlNext}/>
    
    <div id="txModal" style={showTxDetails ? {display: 'block', top: txModalTop} : {display: 'none', top: txModalTop}} className="txModal">
      <span className="font_size20 gradient-font m15T">Transaction Details</span>
      <div className="txModalTableDiv scrollbar">
        <table className="txModalTable">
          <tbody>
          <tr>
            <td className="txModalCol1">Tx ID:</td>
            <td className="txModalCol2">{txDetail && txDetail[0].txHash}</td>
          </tr>
          <tr>
            <td className="txModalCol1">Amount:</td>
            <td className="txModalCol2">{txDetail && txDetail[0].value}</td>
          </tr>
          <tr>
            <td className="txModalCol1">Type:</td>
            <td className={txDetail ? (txDetail[0].status === "pending" ? "txModalCol2 tx-pending" : "txModalCol2") : "txModalCol2" }>{txDetail && txDetail[0].type}</td>
          </tr>
          <tr>
            <td className="txModalCol1">{txDetail ? (txDetail[0].to === '' ? "From" : "To") : "Unknown"} address:</td>
            <td className="txModalCol2">{txDetail ? (txDetail[0].to === '' ? txDetail[0].from : txDetail[0].to) : ""}</td>
          </tr>
          <tr>
            <td className="txModalCol1">Created:</td>
            <td className="txModalCol2">{txDetail && txDetail[0].date} {txDetail && txDetail[0].time}</td>
          </tr>
          <tr>
            <td className="txModalCol1">Mined in block:</td>
            <td className="txModalCol2">{txDetail && txDetail[0].height}</td>
          </tr>
          <tr>
            <td className="txModalCol1">Confirmations:</td>
            <td className="txModalCol2">{txDetail && txDetail[0].confirmations}</td>
          </tr>
          <tr>
            <td className="txModalCol1">Tx Type:</td>
            <td className="txModalCol2">{txDetail && txDetail[0].txtype}</td>
          </tr>
          <tr>
            <td className="txModalCol1">Memo:</td>
            <td className="txModalCol2">{txDetail && txDetail[0].memoLong}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div className="bg-modal w400px h200px" style={showPasswordModal ? {display: 'flex'} : {display: 'none'}}>
      <a onClick={(e) => closeModal()}></a>
      <div className="modalContent w350px h180px">
        <div className="closeModal" onClick={(e) => closeModal()}>
          <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
        </div>
        <div>
          <span className="address-text modal-title font_size20 gradient-font">{modalTitle}</span>
        </div>
        <div className="m15T">
          <input type="password" className="enterPassword" type={showPasswordToggle ? "text" : "password"} size="18" id="sendPassword" placeholder="Enter Password" name="sendPassword"/>
          <img className={showPasswordToggle ? "passwordIcon passwordHide" : "passwordIcon passwordShow"} onClick={(e) => showPassword()} />
        </div>
        <div className="m15T">
          <button className="submitModal scale-hover" onClick={sendTxType ? (e) => sendAmountToAddress() : (e) => consolidateUTXOs()}>Confirm</button>
        </div>
      </div>
    </div>
  </div>)
};
