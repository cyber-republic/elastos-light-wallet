'use strict';

/** imports */
const bip39 = require('bip39');
const bs58 = require('bs58');
const mainConsoleLib = require('console');
const BigNumber = require('bignumber.js');
const crypto = require('crypto');
const Parser = require('rss-parser');

/* Wallets */
const fs = require('fs');
const path = require('path');
const { remote } = require('electron');
const Electron = remote.app;
const userDataPath = Electron.getPath("userData");
const algorithm = 'aes-256-cbc';
let walletNameCreate = '';
let walletNameLogin = '';
let mnemonicExport = '';
let derivationPathExport = '';
let usePassphraseFlag = false;
let createScreen = 'create';
let lastWallet = '';

/* Default variables */
const defaultCurrency = "usd";
const defaultNetworkIx = 0;
const defaultNodeURL = '';
const defaultWalletPath = path.join(userDataPath,"Wallets");
const defaultShowBalance = false;
const defaultAdvancedFeatures = false;
const defaultContextMenu = false;

/* Config variables */
let configCurrency = '';
let configNetworkIx = 0;
let configNodeURL = '';
let configWalletPath = '';
let configShowBalance = '';
let configAdvancedFeatures = '';
let configContextMenu = '';
let developMode = false; // password complexity, fee amount for testing, onClick copy generated mnemonic => moved to config.ini

/* Current variables */
let currentCurrency = defaultCurrency;
let currentNetworkIx = defaultNetworkIx;
let currentNodeURL = '';
let currentWalletPath = defaultWalletPath;
let currentShowBalance = defaultShowBalance;
let currentAdvancedFeatures = defaultAdvancedFeatures;
let currentContextMenu = defaultContextMenu;

/* Config.ini */
let configFile = "Config.ini";
let configFilePath = path.join(userDataPath, configFile);
let defaultConfigContent = "currency="+defaultCurrency+"\nnetworkIx="+defaultNetworkIx+"\nnodeURL="+defaultNodeURL+"\nwalletPath=\nshowBalance="+defaultShowBalance+"\nadvancedFeatures="+defaultAdvancedFeatures+"\ncontextMenu="+defaultContextMenu+"\nlastWallet="+lastWallet;
let configInitialized = false;

/* modules */
const LedgerComm = require('./LedgerComm.js');
const AddressTranscoder = require('./AddressTranscoder.js');
const KeyTranscoder = require('./KeyTranscoder.js');
const TxTranscoder = require('./TxTranscoder.js');
const TxSigner = require('./TxSigner.js');
const Asset = require('./Asset.js');
const TxFactory = require('./TxFactory.js');
const Mnemonic = require('./Mnemonic.js');
const GuiUtils = require('./GuiUtils.js');
const CoinGecko = require('./CoinGecko.js');

/** global constants */
const POLL_INTERVAL = 70000;
let pollForDataTimerID;

const JSON_TIMEOUT = 60000;

const LOG_LEDGER_POLLING = false;

const MAX_POLL_DATA_TYPE_IX = 5;

const PRIVATE_KEY_LENGTH = 64;

const EXPLORER = 'https://blockchain.elastos.org';

const RSS_FEED_URL = 'https://news.elastos.org/feed/';

const REST_SERVICES = [{
    name: 'node1',
    url: 'https://node1.elaphant.app',
  },
  {
    name: 'node3',
    url: 'https://node3.elaphant.app',
  },
];

const LEDGER_UTXO_CONSOLIDATE_COUNT = 20; // Ledger: Starting UTXOs count to get TX size from
const MAX_UTXO_CONSOLIDATE_COUNT = 500; // Non-Ledger: Limit to 500 UTXOs by Elastos blockchain

/** global variables */
let restService;

let ledgerDeviceInfo = undefined;

let publicKey = undefined;

let address = undefined;

let pollDataTypeIx = 0;

let balance = undefined;

let sendAmount = '';

let feeAmountSats = '';

let feeAmountEla = '';

let sendToAddress = '';

let txMemo = '';

let sendStep = 1;

let isLoggedIn = false;

let useLedgerFlag = false;

let usePasswordFlag = false;

let passwordRegEx = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;

let generatedPrivateKeyHex = undefined;

let generatedMnemonic = undefined;

let appClipboard = undefined;

let appDocument = undefined;

let renderApp = () => {};

const sendToAddressStatuses = [];
const sendToAddressLinks = [];

let balanceStatus = 'No Balance Requested Yet';

let transactionHistoryStatus = 'No History Requested Yet';

const parsedTransactionHistory = [];

let producerListStatus = 'No Producers Requested Yet';

let parsedProducerList = {
  totalvotes: '-',
  totalcounts: '-',
  producersCandidateCount: 0,
  producers: [],
};

let candidateVoteListStatus = 'No Candidate Votes Requested Yet';
let voteValue = 0;

let parsedCandidateVoteList = {
  candidateVotes: [],
  lastVote: [],
};
let loadedProducerList = false;
let loadedVotes = false;
let maxCandidates = 36;

let unspentTransactionOutputsStatus = 'No UTXOs Requested Yet';

const parsedUnspentTransactionOutputs = [];
let selectedUTXOs = [];
let customUTXOs = false;
let balanceChange = false;

let blockchainStatus = 'No Blockchain State Requested Yet';

let blockchainState = {};

let blockchainLastActionHeight = 0;
let blockchainLastReceivedHeight = 0;

let parsedRssFeedStatus = 'No Rss Feed Requested Yet';

const parsedRssFeed = [];

let feeStatus = 'No Fee Requested Yet';

let feeRequested = '';
let initFees = '';

let minerFee = 100;

let feeAccountStatus = 'No Fee Account Requested Yet';

let feeAccount = '';

let bannerStatus = '';

let bannerClass = '';

let roundDecimalELA = 8;

let privateKey = '';

const DECIMAL_REGEX = new RegExp('^[0-9]+([,.][0-9]+)?$');

const TRAILING_ZERO_REGEX = new RegExp('^([0-9].[0-9]+?)0+$');

const mainConsole = new mainConsoleLib.Console(process.stdout, process.stderr);

let GuiToggles;

let indexPathMnemonic = 0;
let derivationPathMnemonic = '';
const initTxRecordsCount = 20;
let txRecordsCount = initTxRecordsCount;
let cryptoNameELAAddress = '';

let requests = [];
let urls = [];
let TX_TYPE = '';

let loadedCurrenciesList = false;
let parsedFiatList = [];
let parsedCryptoList = [];

/** context menu */
const Menu = remote.Menu;
const InputMenu = Menu.buildFromTemplate([{
        label: 'Undo',
        role: 'undo',
    }, {
        label: 'Redo',
        role: 'redo',
    }, {
        type: 'separator',
    }, {
        label: 'Cut',
        role: 'cut',
    }, {
        label: 'Copy',
        role: 'copy',
    }, {
        label: 'Paste',
        role: 'paste',
    }, {
        type: 'separator',
    }, {
        label: 'Select all',
        role: 'selectall',
    },
]);

/** functions */
const init = (_GuiToggles) => {
  sendToAddressStatuses.push('No Send-To Transaction Requested Yet');
  GuiToggles = _GuiToggles;
  
  mainConsole.log('Console Logging Enabled.');
  if (developMode) {
    mainConsole.log('Develop mode ENABLED.');
    passwordRegEx = /^.{1,}$/;
    initFees = 1;
  }
  
  requestRssFeed();
  setRestService(defaultNetworkIx);
  if (feeAccount === '') {
    requestFeeAccount();
  }
  requestFee();
  
  // context menu
  if (currentContextMenu) {
    enableContextMenu();
  }
};

const contextMenu = (e) => {
  e.preventDefault();
  e.stopPropagation();
  let node = e.target;
  while (node) {
    if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
      InputMenu.popup(remote.getCurrentWindow());
      break;
    }
    node = node.parentNode;
  }
}

const enableContextMenu = () => {
  document.body.addEventListener('contextmenu', contextMenu);
}

const disableContextMenu = () => {
  document.body.removeEventListener('contextmenu', contextMenu);
}

const setAppClipboard = (clipboard) => {
  appClipboard = clipboard;
};

const setAppDocument = (_document) => {
  appDocument = _document;
};

const setRenderApp = (_renderApp) => {
  renderApp = () => {
    // mainConsole.log('renderApp', 'sendHasFocus', sendHasFocus);
    _renderApp();
  };
};

const getRestService = () => {
  return restService;
};

const setRestService = (ix) => {
  currentNetworkIx = ix;
  if (ix == 99) {
    restService = currentNodeURL;    
  } else {
    restService = REST_SERVICES[ix].url;    
  }  
};

const getTransactionHistoryUrl = (address) => {
  const url = `${restService}/api/v3/history/${address}`;
  return url;
};

const getTransactionHistoryLink = (txid) => {
  const url = `${EXPLORER}/tx/${txid}`;
  return url;
};

const getBalanceUrl = (address) => {
  const url = `${getRestService()}/api/v1/asset/balances/${address}`;
  // mainConsole.log('getBalanceUrl', url);
  return url;
};

const getUnspentTransactionOutputsUrl = (address) => {
  const url = `${getRestService()}/api/v1/asset/utxo/${address}/${Asset.elaAssetId}`;
  return url;
};

const getStateUrl = () => {
  const url = `${getRestService()}/api/v1/node/state`;
  return url;
};

const isValidDecimal = (testAmount) => {
  const isValid = DECIMAL_REGEX.test(testAmount);
  // mainConsole.log('isValidDecimal', 'testAmount', testAmount, isValid);
  return isValid;
};


const formatDate = (date, type) => {
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  const year = date.getFullYear();
  let hour = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hour.length < 2) hour = '0' + hour;
  if (minute.length < 2) minute = '0' + minute;
  if (second.length < 2) second = '0' + second;
  
  if (type === "full") {
    return [year, month, day].join('-')+" "+[hour, minute, second].join(':');
  } else if (type === "date") {
    return [year, month, day].join('-');
  } else {
    return [hour, minute].join(':');
  }
};

const resetNodeURL = () => {
  setRestService(currentNetworkIx);
  renderApp();
};

const changeNodeURL = () => {
  currentNodeURL = GuiUtils.getValue('userNodeURL');
  restService = currentNodeURL;
  renderApp();
};

const publicKeyCallback = (message) => {
  if (LOG_LEDGER_POLLING) {
    mainConsole.log(`publicKeyCallback ${JSON.stringify(message)}`);
  }
  if (message.success) {
    publicKey = message.publicKey;
    requestBlockchainData();
  } else {
    ledgerDeviceInfo.error = true;
    ledgerDeviceInfo.message = message.message;
    bannerStatus = message.message;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
  }
  pollDataTypeIx++;
  setPollForAllInfoTimer();
};

const pollForDataCallback = (message) => {
  if (LOG_LEDGER_POLLING) {
    mainConsole.log(`pollForDataCallback ${JSON.stringify(message)}`);
  }
  ledgerDeviceInfo = message;
  renderApp();
  pollDataTypeIx++;
  setPollForAllInfoTimer();
};

const pollForData = () => {
  //mainConsole.log(getCurrentDateTime(), 'pollForData', pollDataTypeIx);
  try {
    const resetPollIndex = false;
    switch (pollDataTypeIx) {
    case 0:
      pollForDataCallback('Polling...');
      break;
    case 1:
      LedgerComm.getLedgerDeviceInfo(pollForDataCallback);
      break;
    case 2:
      if (useLedgerFlag) {
        LedgerComm.getPublicKey(publicKeyCallback);
      } else {
        pollDataTypeIx++;
        setPollForAllInfoTimer();
      }
      break;
    case 3:
      if (address != undefined) {
        requestTransactionHistory();
        requestBalance();
        requestUnspentTransactionOutputs();
        requestBlockchainState();
      }
      pollDataTypeIx++;
      setPollForAllInfoTimer();
      break;
    case 4:
      if (address != undefined) {
        requestListOfProducers(false);
        requestListOfCandidateVotes();
      }
      /* Moved to init
      requestRssFeed();
      requestFee();
      requestFeeAccount();*/
      if (!loadedCurrenciesList) { // load once
        CoinGecko.requestCurrencies();
        CoinGecko.getCurrencies();
      }
      
      pollDataTypeIx++;
      setPollForAllInfoTimer();
      break;
    case MAX_POLL_DATA_TYPE_IX:
      // only check every 10 seconds for a change in device status.
      pollDataTypeIx = 0;
      clearRequests();
      //mainConsole.log(getCurrentDateTime(), "POLL_INTERVAL", POLL_INTERVAL, "pollForDataTimerID", pollForDataTimerID);
      if (pollForDataTimerID) clearTimeout(pollForDataTimerID);
      pollForDataTimerID = setTimeout(pollForData, POLL_INTERVAL);
      break;
    default:
      throw Error('poll data index reset failed.');
    }
  } catch (error) {
    /*bannerStatus = `Unable to poll data from source.`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();*/
    mainConsole.trace('pollForData', pollDataTypeIx, error);
  }
};

const setPollForAllInfoTimer = () => {
  // mainConsole.trace('setPollForAllInfoTimer', pollDataTypeIx);
  setTimeout(pollForData, 1);
};

const postJson = (url, jsonString, readyCallback, errorCallback) => {
  const xmlhttp = new XMLHttpRequest(); // new HttpRequest instance

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      // sendToAddressStatuses.push( `XMLHttpRequest: status: ${this.status} response:'${this.response}'` );
      if (this.status == 200) {
        readyCallback(JSON.parse(this.response));
      } else {
        errorCallback(this.response);
      }
    }
  };
  xhttp.responseType = 'text';
  if (JSON_TIMEOUT != undefined) {
    xhttp.timeout = JSON_TIMEOUT;
  }
  xhttp.open('POST', url, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.setRequestHeader('Authorization', 'Basic RWxhVXNlcjpFbGExMjM=');

  // sendToAddressStatuses.push( `XMLHttpRequest: curl ${url} -H "Content-Type: application/json" -d '${jsonString}'` );

  xhttp.send(jsonString);
};

const getRssFeed = async (url, readyCallback, errorCallback) => {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL(url);
    readyCallback(feed);
  } catch (error) {
    errorCallback(error);
  }
};

const getJson = (url, readyCallback, errorCallback) => {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        readyCallback(JSON.parse(this.response));
      } else {
        errorCallback({
          'status': this.status,
          'statusText': this.statusText,
          'response': this.response,
        });
      }
    }
  };
  if (JSON_TIMEOUT != undefined) {
    xhttp.timeout = JSON_TIMEOUT;
  }
  xhttp.responseType = 'text';
  xhttp.open('GET', url, true);
  requests.push(xhttp);
  urls.push("Start:"+getCurrentDateTime()+" URL:"+url);
  xhttp.send();  
};

const requestUnspentTransactionOutputs = () => {
  unspentTransactionOutputsStatus = 'UTXOs Requested';
  if (address) {
    const unspentTransactionOutputsUrl = getUnspentTransactionOutputsUrl(address);
    // mainConsole.log( 'unspentTransactionOutputsUrl ' + unspentTransactionOutputsUrl );
    getJson(unspentTransactionOutputsUrl, getUnspentTransactionOutputsReadyCallback, getUnspentTransactionOutputsErrorCallback);
  }
};

const getUnspentTransactionOutputsErrorCallback = (response) => {
  unspentTransactionOutputsStatus = `UTXOs Error ${JSON.stringify(response)}`;

  renderApp();
};

const getUnspentTransactionOutputsReadyCallback = (response) => {
  unspentTransactionOutputsStatus = 'UTXOs Received';
  parsedUnspentTransactionOutputs.length = 0;

  // mainConsole.log('getUnspentTransactionOutputsCallback ' + JSON.stringify(response), response.Result);

  if ((response.Result != undefined) && (response.Result != null) && (response.Error == 0)) {
    response.Result.forEach((utxo, utxoIx) => {
      TxFactory.updateValueSats(utxo, utxoIx);
      parsedUnspentTransactionOutputs.push(utxo);
    });
  }
  
  renderApp();
};

const getPublicKeyFromLedger = () => {
  useLedgerFlag = true;
  isLoggedIn = true;
  maxCandidates = 22;
  LedgerComm.getPublicKey(publicKeyCallback);
};

const requestBlockchainData = (_userRequest) => {
  if (!_userRequest) _userRequest = false;
  
  if (publicKey === undefined) {
    return false;
  }
  address = AddressTranscoder.getAddressFromPublicKey(publicKey);

  requestTransactionHistory();
  requestBalance();
  requestUnspentTransactionOutputs();
  requestBlockchainState();
  
  CoinGecko.requestPriceData();
  
  /* Clear producers and reset timer poll if user request */
  if (_userRequest) {
    reloadProducersAndVotes(_userRequest);
    pollDataTypeIx = MAX_POLL_DATA_TYPE_IX;
    setPollForAllInfoTimer();
  }
};

const reloadProducersAndVotes = (_userRequest) => {
  if (_userRequest) {
    clearParsedProducerList();
    clearParsedCandidateVoteList();
    loadedProducerList = false;
    loadedVotes = false;
  }
  requestListOfProducers(_userRequest);
  requestListOfCandidateVotes();
}

const getPublicKeyFromMnemonic = (_saveWallet) => {
  useLedgerFlag = false;
  isLoggedIn = true;
  maxCandidates = 36;
    
  derivationPathMnemonic = GuiUtils.getValue('derivationPathMnemonic');
  const passphrase = GuiUtils.getValue('passphrase');
  let usePassphrase = false;
  
  if (passphrase.length > 0) usePassphrase = true;
    
  if (derivationPathMnemonic == '') {
    indexPathMnemonic = 0; 
  } else {
    var pathArr = derivationPathMnemonic.split("/");
    indexPathMnemonic = pathArr[pathArr.length-1];
    if (!isValidDecimal(indexPathMnemonic)) {
      bannerStatus = `Derivation path is not valid.`;
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return false;
    }
  }
  
  const mnemonic = GuiUtils.getValue('mnemonic');
  if (!bip39.validateMnemonic(mnemonic)) {
    bannerStatus = `Mnemonic is not valid.`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  
  privateKey = Mnemonic.getPrivateKeyFromMnemonic(mnemonic, indexPathMnemonic, passphrase);
  if (privateKey.length != PRIVATE_KEY_LENGTH) {
    bannerStatus = `Mnemonic must create a of length ${PRIVATE_KEY_LENGTH}, not ${privateKey.length}`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  
  if (_saveWallet) {
    let walletCreated = saveWalletLocally(privateKey, mnemonic, indexPathMnemonic, usePassphrase);
    if (!walletCreated) {
      return false;
    }
  } else {
    GuiUtils.setValue('privateKeyElt', privateKey);
  }
  
  publicKey = KeyTranscoder.getPublic(privateKey);
  requestBlockchainData();
  return true;
};

const saveWalletLocally = (privateKey, mnemonic, indexPathMnemonic, usePassphrase) => {
  let isSaved = false;
  walletNameCreate = GuiUtils.getValue('walletNameCreate');
  if (walletNameCreate.length === 0) {
    bannerStatus = `Please enter Wallet name.`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  
  let newPassword = GuiUtils.getValue('newPassword');
  let confirmPassword = GuiUtils.getValue('confirmPassword');
  if (!passwordRegEx.test(newPassword)) {
    bannerStatus = `Please use stronger password (min 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character).`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;  
  } else {
    if (newPassword !== confirmPassword) {
      bannerStatus = `New password and confirm password do not match.`;
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return false;
    }
  }
  
  let secret = privateKey+"|"+mnemonic+"|"+indexPathMnemonic+"|"+usePassphrase;
  
  isSaved = createWalletFile(walletNameCreate, newPassword, secret, false);
  if (isSaved) {
    usePasswordFlag = true;
    usePassphraseFlag = usePassphrase;
    walletNameLogin = walletNameCreate;
    lastWallet = walletNameLogin;
    updateLastWallet(lastWallet);
    return true;
  } else {
    usePasswordFlag = false;
    return false;
  }
}

const changePassword = () => {
  let oldPassword = GuiUtils.getValue('oldPasswordWallet');
  let newPassword = GuiUtils.getValue('newPasswordWallet');
  let confirmPassword = GuiUtils.getValue('confirmPasswordWallet');
  
  let encryptedWallet = readWalletFile(walletNameLogin);
  let walletTxt = decryptWallet(encryptedWallet, oldPassword);
    
  if (!walletTxt) {
    return false;
  } else {
    let isSaved = false;    
    if (!passwordRegEx.test(newPassword)) {
      bannerStatus = `Please use stronger password (min 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character).`;
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return false;  
    } else {
      if (newPassword !== confirmPassword) {
        bannerStatus = `New password and confirm password do not match.`;
        bannerClass = 'bg_red color_white banner-look';
        GuiToggles.showAllBanners(false);
        renderApp();
        return false;
      }
    }
    
    if (oldPassword === newPassword) {
      bannerStatus = `Old and new password are the same.`;
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return false;
    }
    
    let secret = walletTxt;
    
    isSaved = createWalletFile(walletNameLogin, newPassword, secret, true);
    if (isSaved) {      
      return true;
    } else {
      bannerStatus = `Unknown error.`;
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return false;
    }
  }
}

const loginWithWallet = () => {
  usePasswordFlag = true;
  walletNameLogin = GuiUtils.getValue('walletNameLogin');
  let loginPassword = GuiUtils.getValue('loginPassword');
  
  if (walletNameLogin.length === 0) {
    bannerStatus = `Wallet must be selected.`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;  
  }
  
  let encryptedWallet = readWalletFile(walletNameLogin);
  let walletTxt = decryptWallet(encryptedWallet, loginPassword);
  let privateKeyWallet = '';
  
  if (!walletTxt) {
    // wrong password
    return false;
  } else {
    if (walletTxt.indexOf("|") > 0) {	// new wallets
      var walletTxtParts = walletTxt.split('|');
      privateKeyWallet = walletTxtParts[0].trim();
      //mnemonicWallet = walletTxtParts[1].trim(); // only for export
      //derivationPathWallet = walletTxtParts[2].trim(); // only for export
      usePassphraseFlag = walletTxtParts[3].trim().toLowerCase() == "true" ? true : false;
    } else { // old wallets
      privateKeyWallet = walletTxt;
    }
    
    GuiUtils.setValue('privateKeyElt', privateKeyWallet);
    publicKey = KeyTranscoder.getPublic(privateKeyWallet);
    privateKeyWallet = '';
    requestBlockchainData();
    isLoggedIn = true;
    maxCandidates = 36;
    lastWallet = walletNameLogin;
    updateLastWallet(lastWallet);
    return true;
  }
}

const exportMnemonic = () => {
  let exportPassword = GuiUtils.getValue('exportPassword');
  let exportPassphrase = GuiUtils.getValue('exportPassphrase');
  
  let encryptedWallet = readWalletFile(walletNameLogin);
  let walletTxt = decryptWallet(encryptedWallet, exportPassword);
  let privateKey1 = '';
  let privateKey2 = '';
  
  if (!walletTxt) {
    return false;
  } else {
    if (walletTxt.indexOf("|") > 0) {	// new wallets
      var walletTxtParts = walletTxt.split('|');
      privateKey1 = walletTxtParts[0].trim();
      mnemonicExport = walletTxtParts[1].trim();
      derivationPathExport = walletTxtParts[2].trim();
      //usePassphraseFlag = walletTxtParts[3].trim(); // already set during login
    } else { // old wallets
      bannerStatus = `It is unable to export mnemonic phrase from this wallet, which was created prior this feature was introduced.`;
      bannerClass = 'landing-btnbg color_white banner-look';
      GuiToggles.showAllBanners(true);
      renderApp();
      return false;
    }
    
    if (mnemonicExport === "") {
      bannerStatus = `It is unable to export mnemonic phrase from this wallet, which you have created via Private key import.`;
      bannerClass = 'landing-btnbg color_white banner-look';
      GuiToggles.showAllBanners(true);
      renderApp();
      return false;
    }
    
    privateKey2 = Mnemonic.getPrivateKeyFromMnemonic(mnemonicExport, derivationPathExport, exportPassphrase);    
    if (privateKey1 !== privateKey2) {
      bannerStatus = `You have entered wrong Passphrase.`;
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return false;
    }
    
    privateKey1 = '';
    privateKey2 = '';
    return true;
  }
}

const getPublicKeyFromPrivateKey = (_saveWallet) => {
  useLedgerFlag = false;
  isLoggedIn = true;
  maxCandidates = 36;
  usePasswordFlag = false;
  
  privateKey = GuiUtils.getValue('privateKeyElt');
  if (privateKey.length != PRIVATE_KEY_LENGTH) {
    bannerStatus = `Private key must be a hex encoded string of length ${PRIVATE_KEY_LENGTH}, not ${privateKey.length}`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  
  if (_saveWallet) {
    let walletCreated = saveWalletLocally(privateKey, "", "", "");
    if (!walletCreated) {
      return false;
    }
  }
  publicKey = KeyTranscoder.getPublic(privateKey);
  requestBlockchainData();
  return true;
};

const sendAmountToAddressErrorCallback = (error) => {
  sendToAddressStatuses.push(JSON.stringify(error));
  renderApp();
};

const sendAmountToAddressReadyCallback = (transactionJson) => {
  mainConsole.log('sendAmountToAddressReadyCallback ' + JSON.stringify(transactionJson));
  if (transactionJson.status == 400) {
    sendToAddressStatuses.length = 0;
    const message = `Transaction Error.  Status: ${transactionJson.status}  Result:${transactionJson.result}`;
    bannerStatus = message;
    bannerClass = 'bg_red color_white banner-look';
    sendToAddressStatuses.push(message);
  GuiToggles.showAllBanners(false);
  } else if (transactionJson.Error != 0) {
    sendToAddressStatuses.length = 0;
    const message = `Transaction Error.  Error: ${transactionJson.Error}  Result:${transactionJson.Result}`;
    bannerStatus = message;
    bannerClass = 'bg_red color_white banner-look';
    sendToAddressStatuses.push(message);
  GuiToggles.showAllBanners(false);
  } else {
    sendToAddressStatuses.length = 0;
    const link = getTransactionHistoryLink(transactionJson.result);
    const elt = {};
    elt.txDetailsUrl = link;
    elt.txHash = transactionJson.result;
    sendToAddressStatuses.length = 0;
    const message = `${TX_TYPE} transaction successful.`;
    bannerClass = 'bg_green color_white banner-look';
    sendToAddressStatuses.push(message);
    bannerStatus = message;
    sendToAddressLinks.push(elt);
    requestTransactionHistory();
    GuiToggles.showAllBanners(true);
    clearSendData();
    clearUTXOsSelection();
    setSendStep(1);
  }
  renderApp();
  setBlockchainLastActionHeight();
  //renderApp();
};

const clearSendData = () => {
  // mainConsole.log('STARTED clearSendData');
  feeRequested = initFees;
  GuiUtils.setValue('sendAmount', '');
  GuiUtils.setValue('sendToAddress', '');
  cryptoNameELAAddress = '';
  GuiUtils.setValue('feeAmount', feeRequested);
  GuiUtils.setValue('txMemo', '');
  GuiUtils.setValue('sendPassword', '');
  GuiUtils.setValue('votePassword', '');
  sendAmount = '';
  feeAmountSats = '';
  feeAmountEla = '';
  sendToAddressStatuses.length = 0;
  sendToAddressLinks.length = 0;
  sendToAddress = '';
  txMemo = '';
  setSendStep(1);
  //requestFee();
  //mainConsole.log('SUCCESS clearSendData');
};

const isValidAddress = (testAddress) => {
  if (testAddress.substring(0, 1) != 'E' && testAddress.substring(0, 1) != '8') return false;
  const hexAddress = bs58.decodeUnsafe(testAddress);
  if (!hexAddress) {
    return false;
  } else {
  //mainConsole.log(hexAddress.toString('hex'), hexAddress.toString('hex').length)
  if (hexAddress.toString('hex').length != 50) {
      return false;
  } else {
    return true;
  }
  }  
};

const validateFee = (_validateFee) => {
  if (!isValidDecimal(_validateFee) || (_validateFee == 0)) {
  if (_validateFee.length == 0) {
    bannerStatus = `Please enter valid Fee amount.`;
  } else {
    bannerStatus = `[`+_validateFee+`] is NOT valid Fee amount.`;
  } 
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  return true;
}

const validateInputs = () => {
  sendToAddress = GuiUtils.getValue('sendToAddress');
  sendAmount = GuiUtils.getValue('sendAmount').replace(/,/g, '.');  
  feeAmountSats = GuiUtils.getValue('feeAmount');
  feeRequested = feeAmountSats;
  txMemo = GuiUtils.getValue('txMemo');
  
  const isValidHistory = checkTransactionHistory();
  if (!isValidHistory) {
    return false;
  }
  
  if (!isValidAddress(sendToAddress)) {
    bannerStatus = `Please enter valid Address.`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  
  if (!isValidDecimal(sendAmount) || (sendAmount == 0)) {
  if (sendAmount.length == 0) {
    bannerStatus = `Please enter valid Amount.`;
  } else {
    bannerStatus = `[`+sendAmount+`] is NOT valid amount.`;
  }    
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  
  const isValidFee = validateFee(feeAmountSats);
  if (!isValidFee) {
    return false;
  }
 
  const sendAmountSatsBn = BigNumber(sendAmount, 10).times(Asset.satoshis);
  const feeAmountSatsBn = BigNumber(Number(feeAmountSats) + Number(minerFee), 10);
  const balanceSatsBn = BigNumber(balance, 10).times(Asset.satoshis);
  feeAmountEla = BigNumber(Number(feeAmountSats) + Number(minerFee), 10).dividedBy(Asset.satoshis).toString();
  if (sendAmountSatsBn.plus(feeAmountSatsBn).isGreaterThan(balanceSatsBn)) {
    bannerStatus = `Spending amount [${sendAmount}] + Fees [${feeAmountEla}] is greater than your balance ${balance}.`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  return true;
};

const checkTransactionHistory = () => {
  if (parsedTransactionHistory) {
    if (parsedTransactionHistory[0]) {
      if (parsedTransactionHistory[0].type == 'Sending') {
        bannerStatus = `Please wait for previous transaction to confirm.`;
        bannerClass = 'bg_red color_white banner-look';
        GuiToggles.showAllBanners(false);
        renderApp();
        return false;
      }
    }
  }  
  return true;
};

const showLedgerConfirmBanner = (size) => {
  bannerStatus = `Please review and sign transaction on Ledger (Tx size = ${size} bytes)`;
  mainConsole.log('STARTED showLedgerConfirmBanner', bannerStatus);
  bannerClass = 'landing-btnbg color_white banner-look';
  GuiToggles.showAllBanners(false);
  renderApp();
};

const hideLedgerConfirmBanner = () => {
  GuiToggles.hideAllBanners();
};

const getTxByteLength = (transactionHex) => {
  const transactionByteLength = Math.ceil(transactionHex.length / 2);
  return transactionByteLength;
};

const consolidateUTXOs = () => {
  TX_TYPE = "Consolidate";
  let maxTXSize;
  let utxoMaxCount;
  if (useLedgerFlag) {
    maxTXSize = 1000; // for Ledger, 1024 does not work correctly
    utxoMaxCount = LEDGER_UTXO_CONSOLIDATE_COUNT;
  } else {
    maxTXSize = 1000000;
    utxoMaxCount = MAX_UTXO_CONSOLIDATE_COUNT;
  }
  
  const isValidHistory = checkTransactionHistory();
  if (!isValidHistory) {
    return false;
  }
  
  feeAmountSats = feeRequested;
  const isValidFee = validateFee(feeAmountSats);
  if (!isValidFee) {
    return false;
  }
  
  const getCorrectSizedTX = (utxoMaxCount) => {
    let unspentTransactionOutputs = [];
    if (customUTXOs) {
      unspentTransactionOutputs = selectedUTXOs;
    } else {
      unspentTransactionOutputs = parsedUnspentTransactionOutputs;
    }
    let maxAmountToSend;
    if (!isValidDecimal(feeAmountSats) || (feeAmountSats == 0)) feeAmountSats = 1;
    
    const maxAmountToSpendSats = TxFactory.getMaxAmountToSpendSats(unspentTransactionOutputs, utxoMaxCount);
    maxAmountToSend = BigNumber(maxAmountToSpendSats, 10).minus(minerFee).minus(feeAmountSats).dividedBy(Asset.satoshis).toString();
    
    if (maxAmountToSend < 0) {
      if (customUTXOs) {
        bannerStatus = 'You have selected UTXOs with insufficient ELA amount to consolidate.';
      } else {
        bannerStatus = 'You have insufficient ELA balance to consolidate.';
      }
      bannerClass = 'landing-btnbg color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return false;
    }
    
    let encodedTx;
    const tx = TxFactory.createUnsignedSendToTx(unspentTransactionOutputs, getAddress() , maxAmountToSend, publicKey, feeAmountSats, feeAccount, '', false);
    const encodedUnsignedTx = TxTranscoder.encodeTx(tx, false);
    
    if (Math.ceil(encodedUnsignedTx.length/2) > maxTXSize) {
      getCorrectSizedTX(utxoMaxCount-1); // if TX size too big, try less UTXOs
    } else {
      //mainConsole.log("maxAmountToSend:", maxAmountToSend, "Size bytes",Math.ceil(encodedUnsignedTx.length/2), "utxoMaxCount", utxoMaxCount, "TotalUTXOCount", unspentTransactionOutputs.length);
      
      if (useLedgerFlag) {
        showLedgerConfirmBanner(getTxByteLength(encodedUnsignedTx));
        const sendAmountToAddressLedgerCallback = (message) => {
          if (LOG_LEDGER_POLLING) {
            mainConsole.log(`sendAmountToAddressLedgerCallback ${JSON.stringify(message)}`);
          }

          hideLedgerConfirmBanner();
          if (!message.success) {
            bannerStatus = `Send Error: ${message.message}`;
            bannerClass = 'bg_red color_white banner-look';
            GuiToggles.showAllBanners(false);
            renderApp();
            return;
          }
          const signature = Buffer.from(message.signature, 'hex');
          const encodedTx = TxSigner.addSignatureToTx(tx, publicKey, signature);
          sendAmountToAddressCallback(encodedTx);
        };
        LedgerComm.sign(encodedUnsignedTx, sendAmountToAddressLedgerCallback);
      } else {
        if (usePasswordFlag) {
          walletNameLogin = GuiUtils.getValue('walletNameLogin');
          if (!walletNameLogin) walletNameLogin = walletNameCreate;
          
          const sendPassword = GuiUtils.getValue('sendPassword');
          let encryptedWallet = readWalletFile(walletNameLogin);    
          
          if (sendPassword.length === 0) {
            bannerStatus = `Please enter your Password.`;
            bannerClass = 'bg_red color_white banner-look';
            GuiToggles.showAllBanners(false);
            renderApp();
            return false;  
          } else {
            let walletTxt = decryptWallet(encryptedWallet, sendPassword);
            privateKey = walletTxt;
            if (!privateKey) {
              // wrong password
              return false;
            }
          }
        } else {
          privateKey = GuiUtils.getValue('privateKeyElt');
        }
          
        if (privateKey) {            
          const encodedTx = TxFactory.createSignedSendToTx(privateKey, unspentTransactionOutputs, getAddress(), maxAmountToSend, feeAmountSats, feeAccount, '');
          if (encodedTx == undefined) {
            return false;
          }
          sendAmountToAddressCallback(encodedTx);  
          return true;
        }
      }
    }
  }
  return getCorrectSizedTX(utxoMaxCount);
}

const showConsolidateButton = () => {
  if (parsedUnspentTransactionOutputs.length > 1) { // enable to consolidate if total UTXO count > 1
    return true;
  } else {
    return false;
  }
}

const sendAmountToAddress = () => {
  TX_TYPE = "Send";
  const isValid = validateInputs();
  if (!isValid) {
    return false;
  }
  let unspentTransactionOutputs = [];
  if (customUTXOs) {
    unspentTransactionOutputs = selectedUTXOs;
  } else {
    unspentTransactionOutputs = parsedUnspentTransactionOutputs;
  }
  //mainConsole.log('sendAmountToAddress.unspentTransactionOutputs ' + JSON.stringify(unspentTransactionOutputs));
  let encodedTx;

  if (useLedgerFlag) {
    const tx = TxFactory.createUnsignedSendToTx(unspentTransactionOutputs, sendToAddress, sendAmount, publicKey, feeAmountSats, feeAccount, txMemo, true);
    const encodedUnsignedTx = TxTranscoder.encodeTx(tx, false);
    //console.log(Math.ceil(encodedUnsignedTx.length/2));
    showLedgerConfirmBanner(getTxByteLength(encodedUnsignedTx));
    const sendAmountToAddressLedgerCallback = (message) => {
      if (LOG_LEDGER_POLLING) {
        mainConsole.log(`sendAmountToAddressLedgerCallback ${JSON.stringify(message)}`);
      }

      hideLedgerConfirmBanner();
      if (!message.success) {
        bannerStatus = `Send Error: ${message.message}`;
        bannerClass = 'bg_red color_white banner-look';
        GuiToggles.showAllBanners(false);
        renderApp();
        return;
      }
      const signature = Buffer.from(message.signature, 'hex');
      const encodedTx = TxSigner.addSignatureToTx(tx, publicKey, signature);
      sendAmountToAddressCallback(encodedTx);
    };
    LedgerComm.sign(encodedUnsignedTx, sendAmountToAddressLedgerCallback);
  } else {
  if (usePasswordFlag) {
    walletNameLogin = GuiUtils.getValue('walletNameLogin');
    if (!walletNameLogin) walletNameLogin = walletNameCreate;
    
    const sendPassword = GuiUtils.getValue('sendPassword');
    let encryptedWallet = readWalletFile(walletNameLogin);    
    if (sendPassword.length === 0) {
      bannerStatus = `Please enter your Password.`;
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return false;  
    } else {
      let walletTxt = decryptWallet(encryptedWallet, sendPassword);
      privateKey = walletTxt;
      if (!privateKey) {
        // wrong password
            return false;
        }
      }
    } else {
      privateKey = GuiUtils.getValue('privateKeyElt');
    }
    
    if (privateKey) {
      const encodedTx = TxFactory.createSignedSendToTx(privateKey, unspentTransactionOutputs, sendToAddress, sendAmount, feeAmountSats, feeAccount, txMemo);
        if (encodedTx == undefined) {
          return false;
        }
        sendAmountToAddressCallback(encodedTx);  
      return true;
    }  
  }
};
// success: success,
// message: lastResponse,
// signature: signature

// https://walletservice.readthedocs.io/en/latest/api_guide.html#post--api-1-sendRawTx
const sendAmountToAddressCallback = (encodedTx) => {
  const txUrl = `${getRestService()}/api/v1/transaction`;
  const jsonString = `{"method": "sendrawtransaction", "data": "${encodedTx}"}`;

  // mainConsole.log('sendAmountToAddress.txUrl ' + txUrl);
  // mainConsole.log('sendAmountToAddress.encodedTx ' + JSON.stringify(encodedTx));

  const decodedTx = TxTranscoder.decodeTx(Buffer.from(encodedTx, 'hex'), true);

  // mainConsole.log('sendAmountToAddress.decodedTx ' + JSON.stringify(decodedTx));

  sendToAddressStatuses.length = 0;
  sendToAddressLinks.length = 0;
  sendToAddressStatuses.push(JSON.stringify(encodedTx));
  sendToAddressStatuses.push(JSON.stringify(decodedTx));
  sendToAddressStatuses.push(`Transaction Requested: curl ${txUrl} -H "Content-Type: application/json" -d '${jsonString}'`);
  renderApp();
  postJson(txUrl, jsonString, sendAmountToAddressReadyCallback, sendAmountToAddressErrorCallback);
};

const requestListOfProducersErrorCallback = (response) => {
  producerListStatus = `Error loading Producers`;
  renderApp();
};

const clearParsedProducerList = () => {
  parsedProducerList = {
    totalvotes: '-',
    totalcounts: '-',
    producersCandidateCount: 0,
    producers: [],
  };
}

const requestListOfProducersReadyCallback = (response, _userRequest) => {
  producerListStatus = 'Producers Received';
  
  if (_userRequest) {
    producerListStatus = 'Producers Refreshed';
  } else {
    if (parsedProducerList.producers.length > 0) {
      producerListStatus = 'Producers Refresh Paused';
      renderApp();
      return;
    }
  }
  
  loadedProducerList = false;
  //mainConsole.log('STARTED Producers Callback', response);
  //mainConsole.log(getCurrentDateTime(), 'STARTED Producers Callback');
  clearParsedProducerList();
  if (response.status !== 200) {
    //producerListStatus = `Producers Error: ${JSON.stringify(response)}`;
    producerListStatus = `Error loading Producers`;
  } else {
    parsedProducerList.totalvotes = 0;
    parsedProducerList.totalcounts = 0;

    response.result.sort((producer0, producer1) => {
      return parseFloat(producer1.Votes) - parseFloat(producer0.Votes);
    });

    response.result.forEach((producer) => {
      const parsedProducer = {};
      // mainConsole.log('INTERIM Producers Callback', producer);
      parsedProducer.n = parsedProducerList.producers.length + 1;
      parsedProducer.nickname = producer.Nickname;
      parsedProducer.active = producer.Active.toString();
      parsedProducer.votes = producer.Votes;
      parsedProducer.ownerpublickey = producer.Ownerpublickey;
      parsedProducer.isCandidate = false;
      // mainConsole.log('INTERIM Producers Callback', parsedProducer);
      parsedProducerList.producers.push(parsedProducer);
    });
    loadedProducerList = true;
    // mainConsole.log('INTERIM Producers Callback', response.result.producers[0]);
  }
  // mainConsole.log('SUCCESS Producers Callback');

  renderApp();
};

const requestListOfProducers = (_userRequest) => {
  if (_userRequest) {
    producerListStatus = 'Refreshing Producers, please wait ...';
  } else {
    producerListStatus = 'Loading Producers, please wait ...';
  }
  const txUrl = `${getRestService()}/api/v1/dpos/rank/height/0?state=active`;
  //mainConsole.log(getCurrentDateTime(), 'requestListOfProducers');
  
  if (address) {
    const requestListOfProducersReadyCallbackWrap = (response) => {
      requestListOfProducersReadyCallback(response, _userRequest);
    };

    renderApp();
    getJson(txUrl, requestListOfProducersReadyCallbackWrap, requestListOfProducersErrorCallback);
  }
};

const toggleProducerSelection = (item) => {
  // mainConsole.log('INTERIM toggleProducerSelection item', item);
  const index = item.index;
  // mainConsole.log('INTERIM toggleProducerSelection index', index);
  // mainConsole.log('INTERIM toggleProducerSelection length', parsedProducerList.producers.length);
  const parsedProducer = parsedProducerList.producers[index];
  // mainConsole.log('INTERIM[1] toggleProducerSelection parsedProducer', parsedProducer);
  // mainConsole.log('INTERIM[1] toggleProducerSelection isCandidate', parsedProducer.isCandidate);
  parsedProducer.isCandidate = !parsedProducer.isCandidate;
  // mainConsole.log('INTERIM[2] toggleProducerSelection isCandidate', parsedProducer.isCandidate);

  parsedProducerList.producersCandidateCount = 0;
  parsedProducerList.producers.forEach((parsedProducerElt) => {
    if (parsedProducerElt.isCandidate) {
      parsedProducerList.producersCandidateCount++;
    }
  });

  renderApp();
};

const selectActiveVotes = () => {
  if (!loadedVotes) {
    bannerStatus = `Your previous Votes selection is loading, please wait few seconds or press Refresh and try again.`;
    bannerClass = 'landing-btnbg color_white banner-look';
    GuiToggles.showAllBanners(false);
  } else {
    if (parsedCandidateVoteList.lastVote.length > 0) {
      let activeVotes = new Set(parsedCandidateVoteList.lastVote);
      // let activeVotes = new Set(parsedCandidateVoteList.candidateVotes.map(e => e.ownerpublickey));
      parsedProducerList.producers.map(e => {
        if (activeVotes.has(e.ownerpublickey)) {
          if (!e.isCandidate) {
            e.isCandidate = true;
            parsedProducerList.producersCandidateCount++;
          }
        }
      });
    } else {
      bannerStatus = `Previous Votes not found.`;
      bannerClass = 'landing-btnbg color_white banner-look';
      GuiToggles.showAllBanners(false);
    }
  }
  renderApp();
};

const clearSelection = () => {
  parsedProducerList.producers.map(e => {
    if (e.isCandidate) {
      e.isCandidate = false;
      parsedProducerList.producersCandidateCount--;
    }
  });
  renderApp();
};

const clearUTXOsSelection = () => {
  //mainConsole.log('Before clearUTXOsSelection', selectedUTXOs);
  selectedUTXOs.length = 0;
  selectedUTXOs = [];
  customUTXOs = false;
  
  //mainConsole.log('After clearUTXOsSelection', selectedUTXOs);
  renderApp();
};

const requestListOfCandidateVotesErrorCallback = (response) => {
  mainConsole.log('ERRORED Candidate Votes Callback', response);
  const displayRawError = true;
  if (displayRawError) {
    //candidateVoteListStatus = `Candidate Votes Error: ${JSON.stringify(response)}`;
    candidateVoteListStatus = `Error loading Votes`;
  }
  renderApp();
};

const clearParsedCandidateVoteList = () => {
  voteValue = 0;
  parsedCandidateVoteList = {};
  parsedCandidateVoteList.candidateVotes = [];
  parsedCandidateVoteList.lastVote = [];
}

const requestListOfCandidateVotesReadyCallback = (response) => {
  loadedVotes = false;

  // mainConsole.log('STARTED Candidate Votes Callback', response);
  clearParsedCandidateVoteList();

  if (response.status !== 200) {
    //candidateVoteListStatus = `Candidate Votes Error: ${JSON.stringify(response)}`;
    candidateVoteListStatus = `Error loading Votes`;
  } else {
    if (response.result) {
      parsedCandidateVoteList.lastVote = response.result[0].Vote_Header.Nodes;

      response.result.forEach((candidateVote) => {
        // mainConsole.log('INTERIM Candidate Votes Callback', candidateVote);
        const header = candidateVote.Vote_Header;
        if (header.Is_valid === 'YES') {
          voteValue = BigNumber(header.Value).toFixed(3);
          const body = candidateVote.Vote_Body;
          body.forEach((candidateVoteElt) => {
            const parsedCandidateVote = {};
            if (candidateVoteElt.Active == 1) {
              parsedCandidateVote.n = parsedCandidateVoteList.candidateVotes.length + 1;
              parsedCandidateVote.nickname = candidateVoteElt.Nickname;
              parsedCandidateVote.state = candidateVoteElt.State;
              // parsedCandidateVote.votes = candidateVoteElt.Votes;
              parsedCandidateVote.votes = header.Value;
              parsedCandidateVote.ownerpublickey = candidateVoteElt.Ownerpublickey;
              // mainConsole.log('INTERIM Candidate Votes Callback', parsedCandidateVote);
              parsedCandidateVoteList.candidateVotes.push(parsedCandidateVote);
            }
          });
        }
      });      
    }
    loadedVotes = true;
    if (parsedCandidateVoteList.candidateVotes.length > 0) {
      candidateVoteListStatus = `Votes Received`;
    } else if (parsedCandidateVoteList.lastVote.length > 0) {
      candidateVoteListStatus = `Previous Votes Received`;
    } else {
      candidateVoteListStatus = `Previous Votes not found`;
    }
    // mainConsole.log('INTERIM Candidate Votes Callback', response.result);
  }
  // mainConsole.log('SUCCESS Candidate Votes Callback');

  renderApp();
};

const requestListOfCandidateVotes = () => {
  if (address !== undefined) {
    candidateVoteListStatus = 'Loading Votes, please wait ...';

    const txUrl = `${getRestService()}/api/v1/dpos/address/${address}?pageSize=1&pageNum=1`;
    // mainConsole.log('requestListOfCandidateVotes', txUrl);

    renderApp();
    getJson(txUrl, requestListOfCandidateVotesReadyCallback, requestListOfCandidateVotesErrorCallback);
  }
};

const sendVoteTx = () => {
  TX_TYPE = "Vote";
  try {
    let unspentTransactionOutputs = [];
    if (customUTXOs) {
      unspentTransactionOutputs = selectedUTXOs;
    } else {
      unspentTransactionOutputs = parsedUnspentTransactionOutputs;
    }
    // mainConsole.log('sendVoteTx.unspentTransactionOutputs ' + JSON.stringify(unspentTransactionOutputs));

    const isValid = checkTransactionHistory();
    if (!isValid) {
      return false;
    }
  
    if (parsedProducerList.producersCandidateCount === 0) {
      bannerStatus = 'No candidates selected.';
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return;
    }
    
    if (parsedProducerList.producersCandidateCount > maxCandidates) {
      bannerStatus = 'Too many candidates selected ['+parsedProducerList.producersCandidateCount+'].';
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return;
    }
    
    var subtractFee = BigNumber(Number(feeRequested) + minerFee, 10).dividedBy(Asset.satoshis).toFixed(roundDecimalELA);
    // should be more than fee + minerFee
    if (balance <= subtractFee) {
      bannerStatus = 'You have insufficient ELA balance to vote.';
      bannerClass = 'landing-btnbg color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();
      return;
    }
  
    const candidates = [];
    parsedProducerList.producers.forEach((parsedProducer) => {
      if (parsedProducer.isCandidate) {
        candidates.push(parsedProducer.ownerpublickey);
      }
    });

    // mainConsole.log('sendVoteTx.candidates ' + JSON.stringify(candidates));
  
    feeAmountSats = feeRequested;
    if (!isValidDecimal(feeAmountSats) || (feeAmountSats == 0)) feeAmountSats = 1;
    let encodedTx;

    // mainConsole.log('sendVoteTx.useLedgerFlag ' + JSON.stringify(useLedgerFlag));
    // mainConsole.log('sendVoteTx.unspentTransactionOutputs ' + JSON.stringify(unspentTransactionOutputs));
    if (useLedgerFlag) {
      if (unspentTransactionOutputs) {
        const tx = TxFactory.createUnsignedVoteTx(unspentTransactionOutputs, publicKey, feeAmountSats, candidates, feeAccount);
        const encodedUnsignedTx = TxTranscoder.encodeTx(tx, false);
        candidateVoteListStatus = `Voting for ${parsedProducerList.producersCandidateCount} candidates`;
        showLedgerConfirmBanner(getTxByteLength(encodedUnsignedTx));
        const sendVoteLedgerCallback = (message) => {
          if (LOG_LEDGER_POLLING) {
            mainConsole.log(`sendVoteLedgerCallback ${JSON.stringify(message)}`);
          }
          mainConsole.log(`sendVoteLedgerCallback ${JSON.stringify(message)}`);
          hideLedgerConfirmBanner();
          if (!message.success) {
            candidateVoteListStatus = `Vote Error: ${message.message}`;
            bannerStatus = candidateVoteListStatus;
            bannerClass = 'bg_red color_white banner-look';
            GuiToggles.showAllBanners(false);
            renderApp();
            return false;
          }
          const signature = Buffer.from(message.signature, 'hex');
          const encodedTx = TxSigner.addSignatureToTx(tx, publicKey, signature);
          sendVoteCallback(encodedTx);
        };
        //candidateVoteListStatus += ', please confirm TX on Ledger';
        LedgerComm.sign(encodedUnsignedTx, sendVoteLedgerCallback);
      } else {
        bannerStatus = `UTXOs have not been retrieved yet, please wait ...`;
        bannerClass = 'landing-btnbg color_white banner-look';
        GuiToggles.showAllBanners(false);
        renderApp();        
      }
    } else {
      if (usePasswordFlag) {
        walletNameLogin = GuiUtils.getValue('walletNameLogin');
        if (!walletNameLogin) walletNameLogin = walletNameCreate;
        const votePassword = GuiUtils.getValue('votePassword');
        let encryptedWallet = readWalletFile(walletNameLogin);    
        if (votePassword.length === 0) {
          bannerStatus = `Please enter your Password.`;
          bannerClass = 'bg_red color_white banner-look';
          GuiToggles.showAllBanners(false);
          renderApp();
          return false;  
        } else {
          let walletTxt = decryptWallet(encryptedWallet, votePassword);
          privateKey = walletTxt;
          if (!privateKey) {
            // wrong password
            return false;
          }
        }
    } else {
      privateKey = GuiUtils.getValue('privateKeyElt');
    }
  
    if (privateKey) {
      const encodedTx = TxFactory.createSignedVoteTx(privateKey, unspentTransactionOutputs, feeAmountSats, candidates, feeAccount);
      if (encodedTx == undefined) {
        return false;
      }
      sendVoteCallback(encodedTx);
    }
    // mainConsole.log('sendVoteTx.encodedTx ' + JSON.stringify(encodedTx));
    }
  } catch (error) {
    //mainConsole.trace(error);
    bannerStatus = `Error vote: Check your balance, press Refresh and wait a few seconds or restart application and try again.`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  return true;
};
// success: success,
// message: lastResponse,
// signature: signature

const sendVoteCallback = (encodedTx) => {
  const txUrl = `${getRestService()}/api/v1/transaction`;
  const jsonString = `{"method": "sendrawtransaction", "data": "${encodedTx}"}`;

  // mainConsole.log('sendVoteCallback.encodedTx ' + JSON.stringify(encodedTx));

  const decodedTx = TxTranscoder.decodeTx(Buffer.from(encodedTx, 'hex'), true);

  // mainConsole.log('sendVoteCallback.decodedTx ' + JSON.stringify(decodedTx));

  // sendToAddressStatuses.length = 0;
  // sendToAddressLinks.length = 0;
  // sendToAddressStatuses.push(JSON.stringify(encodedTx));
  // sendToAddressStatuses.push(JSON.stringify(decodedTx));
  // sendToAddressStatuses.push(`Transaction Requested: curl ${txUrl} -H "Content-Type: application/json" -d '${jsonString}'`);
  renderApp();
  postJson(txUrl, jsonString, sendVoteReadyCallback, senVoteErrorCallback);
};

const senVoteErrorCallback = (error) => {
  mainConsole.log('senVoteErrorCallback ' + JSON.stringify(error));
  // sendToAddressStatuses.push(JSON.stringify(error));
  renderApp();
};

const sendVoteReadyCallback = (transactionJson) => {
  mainConsole.log('sendVoteReadyCallback ' + JSON.stringify(transactionJson));
  if (transactionJson.Error) {
    candidateVoteListStatus = `Vote Error: ${transactionJson.Error} ${transactionJson.Result}`;
    bannerStatus = candidateVoteListStatus;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
  } else {
    candidateVoteListStatus = `${TX_TYPE} transaction successful.`;
    GuiToggles.showHome();
    bannerStatus = `${TX_TYPE} transaction successful.`;
    bannerClass = 'bg_green color_white banner-look';
    requestTransactionHistory();
    GuiToggles.showAllBanners(true);
    clearSendData();
    clearUTXOsSelection();
  }  
  renderApp();
};

const getTransactionHistoryErrorCallback = (response) => {
  //transactionHistoryStatus = `History Error: ${JSON.stringify(response)}`;
  transactionHistoryStatus = `Error loading History`;
  renderApp();
};

const formatTxValue = (value) => {
  const elaFloat = parseInt(value) / 100000000;
  const elaDisplay = elaFloat.toFixed(8).replace(TRAILING_ZERO_REGEX, '$1');
  return elaDisplay;
}

const getTransactionHistoryReadyCallback = (transactionHistory) => {
  //mainConsole.log('getTransactionHistoryReadyCallback ' + JSON.stringify(transactionHistory));
  transactionHistoryStatus = 'History Received';
  parsedTransactionHistory.length = 0;
  if (transactionHistory.result !== undefined) {
    if (transactionHistory.result.History !== undefined) {
      transactionHistory.result.History.forEach((tx, txIx) => {
        let date = formatDate(new Date(tx.CreateTime * 1000),"date");
        let time = formatDate(new Date(tx.CreateTime * 1000),"time");
        if (tx.CreateTime == 0) {
          date = formatDate(new Date(),"date");
          time = '';
        }
        const parsedTransaction = {};
        parsedTransaction.sortTime = tx.CreateTime;
        if (tx.Status == 'pending' && tx.CreateTime == 0) {
          parsedTransaction.sortTime = Math.floor(new Date() / 1000);
        }
        //mainConsole.log(tx);
        parsedTransaction.n = txIx;
        parsedTransaction.type = tx.Type;
        if (tx.Type == 'income') {
          parsedTransaction.type = 'Received';
          parsedTransaction.from = tx.Inputs[0];
          parsedTransaction.to = '';
        }
        if (tx.Type == 'spend') {
          parsedTransaction.type = 'Sent';
          parsedTransaction.from = '';
          parsedTransaction.to = tx.Outputs[0];
        }
        if (tx.Type == 'spend' && tx.Status == 'pending') {
          parsedTransaction.type = 'Sending';
        }
        if (tx.Type == 'income' && tx.Status == 'pending') {
          parsedTransaction.type = 'Receiving';
        }
        parsedTransaction.status = tx.Status;
        parsedTransaction.valueSat = tx.Value;
        
        parsedTransaction.value = BigNumber(parsedTransaction.valueSat, 10).dividedBy(Asset.satoshis).toFixed(roundDecimalELA);
        parsedTransaction.valueShort = BigNumber(parsedTransaction.valueSat, 10).dividedBy(Asset.satoshis).toFixed(4);
        //mainConsole.log(parsedTransaction.valueShort);
        //parsedTransaction.value = formatTxValue(tx.Value);
        parsedTransaction.address = tx.Address;
        parsedTransaction.txHash = tx.Txid;
        parsedTransaction.txHashWithEllipsis = tx.Txid;
        if (parsedTransaction.txHashWithEllipsis.length > 7) {
          parsedTransaction.txHashWithEllipsis = parsedTransaction.txHashWithEllipsis.substring(0, 7) + '...';
        }
        parsedTransaction.txDetailsUrl = getTransactionHistoryLink(tx.Txid);
        parsedTransaction.date = date;
        parsedTransaction.time = time;
        let memo = tx.Memo;
        if (memo.indexOf("type:text,msg:") >= 0) memo = memo.substring(14, memo.length).trim();
        parsedTransaction.memoLong = memo;
        if (memo.length > 14) {
          var n = 0;
          if (memo.indexOf("From ELABank,") >= 0) n = n + 13;
          parsedTransaction.memo = memo.substring(n, n + 24) + '...'.trim();
        } else {
          parsedTransaction.memo = memo;
        }
        if (tx.CreateTime != 0) {
          let confirmedHeight = tx.Height;
          let confirmations = blockchainLastReceivedHeight - confirmedHeight;
          parsedTransaction.height = tx.Height;
          parsedTransaction.confirmations = confirmations;
        } else {
          parsedTransaction.confirmations = "Not Confirmed";
          parsedTransaction.height = "";
        }
        if (tx.TxType === "transferAsset") {
          parsedTransaction.txtype = "Asset Transfer";
        } else if (tx.TxType === "vote") {
          parsedTransaction.txtype = "Vote";
        } else {
          parsedTransaction.txtype = "Unknown";
        }
        
        parsedTransactionHistory.push(parsedTransaction);
        // mainConsole.log(parsedTransaction);
      });
    }
  }

  parsedTransactionHistory.sort((a, b) => {
    return b.sortTime - a.sortTime;
  });

  renderApp();
};

const requestTransactionHistory = () => {
  transactionHistoryStatus = 'History Requested';
  if (address) {
    const transactionHistoryUrl = getTransactionHistoryUrl(address);
    // mainConsole.log('requestTransactionHistory ' + transactionHistoryUrl);
    getJson(transactionHistoryUrl, getTransactionHistoryReadyCallback, getTransactionHistoryErrorCallback);
  }
};

const getBalanceErrorCallback = (response) => {
  balanceStatus = `Balance Error:${JSON.stringify(response)} `;
  balance = undefined;
};

const getBalanceReadyCallback = (balanceResponse) => {
  let lastBalance = balance;
  if (balanceResponse.Error == 0) {
    balanceStatus = `Balance Received.`;
    balance = balanceResponse.Result;
    if (lastBalance !== balance) {
      balanceChange = true;
      if (customUTXOs) {
        clearUTXOsSelection();
      }
    } else {
      balanceChange = false;
    }
  } else {
    //balanceStatus = `Balance Received Error:${balanceResponse.Error}`;
    balanceStatus = `Error receiving balance`;
    balance = undefined;
  }
  // mainConsole.log('getBalanceReadyCallback ' + JSON.stringify(balanceResponse));

  renderApp();
};

const requestBalance = () => {
  if (address != undefined) {
    const balanceUrl = getBalanceUrl(address);
    balanceStatus = `Balance Requested ${balanceUrl}`;
    getJson(balanceUrl, getBalanceReadyCallback, getBalanceErrorCallback);
  }
};

const getBlockchainStateErrorCallback = (blockchainStateResponse) => {
  balanceStatus = 'Blockchain State Error ' + blockchainStateResponse.Error;
  blockchainState = blockchainStateResponse.Result;
};

const getBlockchainStateReadyCallback = (blockchainStateResponse) => {
  // mainConsole.log('getBlockchainStateReadyCallback ', blockchainStateResponse);
  if (blockchainStateResponse.Error == 0) {
    blockchainStatus = `Blockchain State Received`;
    blockchainState = blockchainStateResponse.Result;
    blockchainLastReceivedHeight = blockchainState.height;
  } else {
    balanceStatus = 'Blockchain State Error ' + blockchainStateResponse.Error;
    blockchainState = blockchainStateResponse.Result;
  }

  renderApp();
};

const requestBlockchainState = () => {
  const stateUrl = getStateUrl();
  blockchainState = {};
  blockchainStatus = `Blockchain State Requested`;
  getJson(stateUrl, getBlockchainStateReadyCallback, getBlockchainStateErrorCallback);
};

const getConfirmations = () => {
  if (blockchainState) {
    if (blockchainState.height) {
      return blockchainState.height - blockchainLastActionHeight;
    } else {
      return 0;
    }
  }
};

const setBlockchainLastActionHeight = () => {
  if (blockchainState.height) {
    blockchainLastActionHeight = blockchainState.height;
  }
};

const copyAddressToClipboard = () => {
  if (address != undefined) {
    appClipboard.writeText(address);
    bannerStatus = `Copied to clipboard:\n${address}`;
    bannerClass = 'bg_green color_white banner-look';
    GuiToggles.showAllBanners(true);
    renderApp();
  } else {
    getPublicKeyFromLedger();
  }
};

const copyMnemonicToClipboard = () => {
  appClipboard.writeText(generatedMnemonic);
  bannerStatus = `Copied to clipboard:\n${generatedMnemonic}`;
  bannerClass = 'bg_green color_white banner-look';
  GuiToggles.showAllBanners(true);
  renderApp();
};

const copyPrivateKeyToClipboard = () => {
  appClipboard.writeText(generatedPrivateKeyHex);
  bannerStatus = `Copied to clipboard:\n${generatedPrivateKeyHex}`;
  bannerClass = 'bg_green color_white banner-look';
  GuiToggles.showAllBanners(true);
  renderApp();
};

const verifyLedgerBanner = () => {
  if (address != undefined && useLedgerFlag) {
    bannerStatus = `Please verify address [${address}] on your Ledger Device by pressing the right button.`;
    bannerClass = 'landing-btnbg color_white banner-look';
  } else {
    if (useLedgerFlag) {
      getPublicKeyFromLedger();
    } else {
      bannerStatus = `No Ledger device connected`;
        bannerClass = 'landing-btnbg color_white banner-look';
    }
  }

  GuiToggles.showAllBanners(false);
  renderApp();
};

const isLedgerConnected = () => {
  return useLedgerFlag;
};

const getCurrentDateTime = () => {
  return formatDate(new Date(), "full");
}

const listRequests = () => {
  let i = 0;
  let runningRequests = [];
  let finishedRequests = [];
  let abortedRequests = [];
  let otherRequests = [];
  requests.forEach(function(request) {
    if (request.readyState === 0) {
      abortedRequests.push(urls[i]);
    } else if (request.readyState === 1) {
      runningRequests.push(urls[i]);
    } else if (request.readyState === 4) {
      finishedRequests.push(urls[i]);
    } else {
      otherRequests.push(urls[i]);
    }
    console.log(getCurrentDateTime(), "State:"+request.readyState, urls[i]);
    i++;
  });
  //mainConsole.log(getCurrentDateTime(), "Requests:", requests.length, "Urls:", urls.length);
  console.log(getCurrentDateTime(), "Aborted Requests:", abortedRequests.length, "Running Requests:", runningRequests.length, "Finished Requests:", finishedRequests.length, "Other Requests:", otherRequests.length);
}

const clearRequests = () => {
  let removedRequests = [];
  for (let i = requests.length - 1; i >= 0; i--) {
    if (requests[i].readyState === 4) {
      requests[i].abort();
      removedRequests.push(urls[i]);
      //mainConsole.log(getCurrentDateTime(), "Removed", requests[i].readyState, urls[i]);
      requests.splice(i, 1);
      urls.splice(i, 1);
    }
  }
  //mainConsole.log(getCurrentDateTime(), "Removed Requests:", removedRequests.length);
}

const clearGlobalData = () => {
  // mainConsole.log('STARTED clearGlobalData');
  
  /* Clear old getJson requests */
  clearRequests();
  
  /* Clear Cache */
  let win = remote.getCurrentWindow();
  win.webContents.session.clearCache(function(){
    // mainConsole.log('Cache cleared');
  });
  
  /* Clear general UI */
  sendStep = 1;
  isLoggedIn = false;
  useLedgerFlag = false;
  usePasswordFlag = false;
  usePassphraseFlag = false;
  setTxRecordsCount(initTxRecordsCount);
  
  privateKey = '';
  publicKey = undefined;
  address = undefined;
  balance = undefined;
  generatedPrivateKeyHex = undefined;
  generatedMnemonic = undefined;
  balanceStatus = 'No Balance Requested Yet';
  
  /* Clear wallet data */
  GuiUtils.setValue('privateKeyElt', '');
  GuiUtils.setValue('mnemonic', '');
  GuiUtils.setValue('derivationPathMnemonic', '');
  //GuiUtils.setValue('derivationPathLedger', ''); // remember last wallet name on logout
  //GuiUtils.setValue('walletNameLogin', ''); // remember last wallet name on logout
  GuiUtils.setValue('loginPassword', '');
  walletNameLogin = '';
  
  /* Clear wallet creation data */
  GuiUtils.setValue('walletNameCreate', '');
  GuiUtils.setValue('newPassword', '');
  GuiUtils.setValue('confirmPassword', '');
  GuiUtils.setValue('passphrase', '');
  GuiUtils.setValue('mnemonic', '');
  walletNameCreate = '';
  
  /* Clear Settings */
  GuiUtils.setValue('nodeURL', '');
  createScreen = 'create';
  
  /* Clear export mnemonic data */
  GuiUtils.setValue('exportPassword', '');
  GuiUtils.setValue('exportPassphrase', '');
  mnemonicExport = '';
  derivationPathExport = '';
  
  cryptoNameELAAddress = '';

  sendToAddressStatuses.length = 0;
  sendToAddressLinks.length = 0;
  sendToAddressStatuses.push('No Send-To Transaction Requested Yet');

  /* Clear transactions */
  transactionHistoryStatus = 'No History Requested Yet';
  parsedTransactionHistory.length = 0;

  unspentTransactionOutputsStatus = 'No UTXOs Requested Yet';
  parsedUnspentTransactionOutputs.length = 0;
  
  clearUTXOsSelection();
  
  /* Clear feed - moved to init */
  //parsedRssFeed.length = 0;
  //parsedRssFeedStatus = 'No Rss Feed Requested Yet';
  
  /* Clear banners */
  bannerStatus = '';
  bannerClass = '';
  
  /* Clear producers & candidates */
  clearParsedProducerList();
  clearParsedCandidateVoteList();
  loadedProducerList = false;
  loadedVotes = false;
  
  /* Reload config */
  //configInitialized = false;

  renderApp();
  //mainConsole.log('SUCCESS clearGlobalData');
};

const getLedgerDeviceInfo = () => {
  return ledgerDeviceInfo;
};

const getMainConsole = () => {
  return mainConsole;
};

const getELABalance = () => {
  if (balance) {
    return balance;
  }
  return '?';
};

const getELACustomBalance = () => {
  if (customUTXOs) {
    let customBalance = selectedUTXOs.reduce((total, currentValue) => total = total + Number(currentValue.Value),0);
    return customBalance;
  } else {
    if (balance) {
      return balance;
    }
  }
};

const getCurrencyBalance = () => {
  const data = CoinGecko.getPriceData();
  if (data) {
    const elastos = data.elastos;
    if (elastos) {
      const fiat = elastos[currentCurrency];      
      
      // mainConsole.log('getFiatBalance', fiat, balance, balanceStatus);
      if (balance) {
        return (parseFloat(fiat) * parseFloat(balance)).toFixed(3);
      }
    }
  }
  return '?';
};

const parseCurrencyList = () => {
  const currenciesList = CoinGecko.getCurrencies();
  if (currenciesList && !loadedCurrenciesList) {
    parsedFiatList = [];
    parsedCryptoList = [];
    let obj = JSON.parse(JSON.stringify(currenciesList.rates));
    let keysArray = Object.keys(obj);
    for (let i = 0; i < keysArray.length; i++) {
      var key = keysArray[i];
      var value = obj[key];
      if (value.type === "fiat") {
        parsedFiatList.push(key);        
      } else if (value.type === "crypto") {
        parsedCryptoList.push(key);        
      }
    }
    loadedCurrenciesList = true;
    parsedFiatList = parsedFiatList.sort();
    parsedCryptoList = parsedCryptoList.sort();
    renderApp();
    GuiUtils.setValue('userCurrency', currentCurrency.toUpperCase());
  } else {
    parsedFiatList.push("usd");
  }
};

const getParsedFiatList = () => {
  return parsedFiatList;
}

const getParsedCryptoList = () => {
  return parsedCryptoList;
}

const getAddress = () => {
  return address;
};

const getParsedProducerList = () => {
  return parsedProducerList;
};

const getProducerListStatus = () => {
  return producerListStatus;
};

const getParsedTransactionHistory = () => {
  return parsedTransactionHistory;
};

const getBlockchainState = () => {
  if (blockchainState) {
    return blockchainState;
  }
  return {};
};

const getBlockchainStatus = () => {
  return blockchainStatus;
};

const getTransactionHistoryStatus = () => {
  return transactionHistoryStatus;
};

const getSendToAddressStatuses = () => {
  return sendToAddressStatuses;
};

const getSendToAddressLinks = () => {
  return sendToAddressLinks;
};

const getSendAmount = () => {
  return sendAmount;
};

const getFeeAmountEla = () => {
  return feeAmountEla;
};

const getSendToAddress = () => {
  return sendToAddress;
};

const getFeeAmountSats = () => {
  return feeAmountSats;
};

const getTxMemo = (_short) => {
  let maxLength = 55;
  if (_short) {
    if (txMemo.length > maxLength) {
      return txMemo.substr(0,maxLength)+" ...";
    } else {
      return txMemo;
    }
  }
  return txMemo;
};

const writeSendData = () => {
  sendToAddress = GuiUtils.getValue('sendToAddress');
  sendAmount = GuiUtils.getValue('sendAmount').replace(/,/g, '.');  
  feeAmountSats = GuiUtils.getValue('feeAmount');
  txMemo = GuiUtils.getValue('txMemo');
  feeRequested = feeAmountSats;
}

const getSendStep = () => {
  return sendStep;
};

const setSendStep = (_sendStep) => {
  sendStep = _sendStep;
};

const renderAppWrapper = () => {
  renderApp();
};

const getCurrentNetworkIx = () => {
  return currentNetworkIx;
};

const getCandidateVoteListStatus = () => {
  return candidateVoteListStatus;
};

const getParsedCandidateVoteList = () => {
  return parsedCandidateVoteList;
};

const getVoteValue = () => {
  return voteValue;
};

const getAddressOrBlank = () => {
  const address = getAddress();
  if (address != undefined) {
    return address;
  }
  return '';
};


const requestRssFeed = async () => {
  parsedRssFeedStatus = 'Rss Feed Requested';
  getRssFeed(RSS_FEED_URL, getRssFeedReadyCallback, getRssFeedErrorCallback);
};

const getRssFeedErrorCallback = (error) => {
  mainConsole.log('getRssFeedErrorCallback ', error);
  parsedRssFeedStatus = `Rss Feed Error ${error.message}`;
  renderApp();
};

const getRssFeedReadyCallback = (response) => {
  parsedRssFeedStatus = 'Rss Feed Received';
  parsedRssFeed.length = 0;

  // mainConsole.log('getRssFeedReadyCallback ', response);

  if ((response.items != undefined) && (response.items != null)) {
    response.items.forEach((item, itemIx) => {
      parsedRssFeed.push(item);
    });
  }

  renderApp();
};

const requestFee = async () => {
  const feeUrl = `${getRestService()}/api/v1/fee`;
  feeStatus = 'Fee Requested';
  if (initFees === '') {
    getJson(feeUrl, getFeeReadyCallback, getFeeErrorCallback);
  }
};

const getFeeErrorCallback = (error) => {
  // mainConsole.log('getFeeErrorCallback ', error);
  feeStatus = `Rss Feed Error ${error.message}`;
  initFees = '';
  feeRequested = initFees;
  renderApp();
};

const getFeeReadyCallback = (response) => {
  feeStatus = 'Fee Received';
  if (initFees === '') { 
    initFees = response.result.toString();
    feeRequested = initFees;
  }
  // mainConsole.log('getFeeReadyCallback ', response, fee);
  renderApp();
};


const requestFeeAccount = async () => {
  const feeAccountUrl = `${getRestService()}/api/v1/node/reward/address`;
  feeAccountStatus = 'Fee Account Requested';
  // mainConsole.log('requestFeeAccount ', feeAccountStatus);
  getJson(feeAccountUrl, getFeeAccountReadyCallback, getFeeAccountErrorCallback);
};

const getFeeAccountErrorCallback = (error) => {
  // mainConsole.log('getFeeErrorCallback ', error);
  feeAccountStatus = `Rss Account Feed Error ${error.message}`;
  feeAccount = '';
  renderApp();
};

const getFeeAccountReadyCallback = (response) => {
  feeAccountStatus = 'Fee Account Received';
  feeAccount = response.result;
  // mainConsole.log('getFeeAccountReadyCallback ', response, feeAccount);
  renderApp();
};

const getParsedRssFeed = () => {
  return parsedRssFeed;
};

const getBannerStatus = () => {
  return bannerStatus;
};

const getBannerClass = () => {
  return bannerClass;
};

const getFee = () => {
  return feeRequested;
};

const generatePrivateKeyHex = () => {
  generatedPrivateKeyHex = crypto.randomBytes(32).toString('hex');
};

const getGeneratedPrivateKeyHex = () => {
  return generatedPrivateKeyHex;
};

const generateMnemonic = () => {
  generatedMnemonic = bip39.entropyToMnemonic(crypto.randomBytes(16).toString('hex'));
};

const getGeneratedMnemonic = () => {
  return generatedMnemonic;
};

const insertELA = (type) => {
  feeAmountSats = GuiUtils.getValue('feeAmount');
  feeRequested = feeAmountSats;
  var subtractFee = BigNumber(Number(feeAmountSats) + minerFee, 10).dividedBy(Asset.satoshis).toFixed(roundDecimalELA);
  
  if (type == "quarter") {
    var newAmount = BigNumber(Number(getELACustomBalance())/4).decimalPlaces(roundDecimalELA).toFixed(roundDecimalELA);    
  }
  
  if (type == "half") {
    var newAmount = BigNumber(Number(getELACustomBalance())/2).decimalPlaces(roundDecimalELA).toFixed(roundDecimalELA);
  }
  
  if (type == "max") {
    var newAmount = BigNumber(Number(getELACustomBalance())-Number(subtractFee)).decimalPlaces(roundDecimalELA).toFixed(roundDecimalELA);
  }
  
  if (newAmount < 0) newAmount = 0;
  //mainConsole.log("getELACustomBalance()", getELACustomBalance(), "newAmount", newAmount, "subtractFee", subtractFee);
    
  if (Number(getELACustomBalance()).toFixed(roundDecimalELA) < (Number(newAmount) + Number(subtractFee)).toFixed(roundDecimalELA)) {
    newAmount = 0;
    bannerStatus = 'You have insufficient ELA balance to spend.';
    bannerClass = 'landing-btnbg color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  } else {
    if (getELACustomBalance() == "?") {
      getPublicKeyFromLedger();
    } else {
      GuiUtils.setValue('sendAmount',newAmount);
      sendAmount = newAmount;
      renderApp();
    }
  }
}

const getTotalSpendingELA = () => {  
  var totalSpendingELA = BigNumber(Number(getSendAmount())+Number(BigNumber(Number(feeAmountSats) + minerFee, 10).dividedBy(Asset.satoshis).toString())).decimalPlaces(roundDecimalELA).toString();
  //mainConsole.log(totalSpendingELA,roundDecimalELA);
  return totalSpendingELA;
}

const encryptWallet = (text, password) => {
  const keyBytes = crypto.createHash('sha256').update(password).digest();
  const ivBytes = crypto.randomBytes(16);
  const encryptKey = crypto.createCipheriv(algorithm, keyBytes, ivBytes);
  
  let encryptedString = encryptKey.update(text)
  encryptedString = Buffer.concat([encryptedString, encryptKey.final()]);
  
  return ivBytes.toString('hex') + '!' + encryptedString.toString('hex');
}

const decryptWallet = (text, password) => {
  const textParts = text.split('!');
  if (textParts.length === 2) {
    const keyBytes = crypto.createHash('sha256').update(password).digest();
    const ivBytes = Buffer.from(textParts.shift(), 'hex');  
      
    let encryptedString = Buffer.from(textParts.join('!'), 'hex');
    
    let decryptKey = crypto.createDecipheriv(algorithm, keyBytes, ivBytes);
    let decryptedString = decryptKey.update(encryptedString);
    try {
      decryptedString = Buffer.concat([decryptedString, decryptKey.final()]);
    } catch {
      bannerStatus = `Wrong password`;
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();      
      return false;
    }  
    return decryptedString.toString();
  } else {
    bannerStatus = `Wallet file is not compatible`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();    
    return false;
  }
}

const createWalletFolder = () => {
  if (!fs.existsSync(currentWalletPath)) {
    fs.mkdirSync(currentWalletPath);
  }
  return true;
}

const createWalletFile = (walletName, password, text, override) => {
  var filePath = path.join(currentWalletPath, walletName+".dat");
  if (!fs.existsSync(filePath) || override) {
    fs.writeFile(filePath , encryptWallet(text, password), "utf8", (err) => {
      if (err) throw err;
      if (!override) {
        bannerStatus = `Local wallet created successfully.`;
        updateLastWallet(walletName);
      } else {
        bannerStatus = `Password changed successfully.`;
      }
      bannerClass = 'bg_green color_white banner-look';    
      GuiToggles.showAllBanners(true);
      renderApp();        
      return true;
    });
  } else {
    bannerStatus = `Wallet with entered name already exist.`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  return true;
}

const removeWalletFile = () => {
  let walletNameRemove = GuiUtils.getValue('walletNameRemove');  
  let removePassword = GuiUtils.getValue('removePassword');
  
  if (walletNameRemove.length === 0) {
    bannerStatus = `Please select wallet name to remove`;
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  
  var filePath = path.join(currentWalletPath, walletNameRemove+".dat");
  if (fs.existsSync(filePath)) {
    let encryptedWallet = readWalletFile(walletNameRemove);
    let walletTxt = decryptWallet(encryptedWallet, removePassword);
    
    if (!walletTxt) {
      bannerStatus = "Wrong password.";
      bannerClass = 'bg_red color_white banner-look';
      GuiToggles.showAllBanners(false);
      renderApp();    
      return false;
    } else {
      fs.unlink(filePath, (err) => {
        if (err) {
          bannerStatus = "Unable to remove wallet file.";
          bannerClass = 'bg_red color_white banner-look';
          GuiToggles.showAllBanners(false);
          renderApp();    
          return false;
        }
        bannerStatus = `Local wallet removed successfully.`;
        bannerClass = 'bg_green color_white banner-look';    
        GuiToggles.showAllBanners(true);
        renderApp();
        GuiUtils.setValue('removePassword', '');    
        return true;
      });
    }
  } else {  
    bannerStatus = filePath+" does NOT exist.";
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();    
    return false;
  }
}

const readWalletFile = (walletName) => {
  var filePath = path.join(currentWalletPath, walletName+".dat");
  if (fs.existsSync(filePath)) {
    var data = fs.readFileSync(filePath,'utf8');
    return data;
  } else {
    bannerStatus = filePath+" does NOT exist.";
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
}

const listWalletFiles = () => {
  let walletFiles = [];
  if (fs.existsSync(currentWalletPath)) {  
    fs.readdirSync(currentWalletPath).forEach(file => {
      if (file.substr(file.length-3,3) === "dat") {
        walletFiles.push(file.substring(0,file.length-4));
      }
    });
    return walletFiles;  
  }
}

const getPasswordFlag = () => {
  return usePasswordFlag;
}

const getLoggedIn = () => {
  return isLoggedIn;
}

const setCurrentWalletPath = (_currentWalletPath) => {
  currentWalletPath = _currentWalletPath;
}

const getDefaultWalletPath = () => {
  return defaultWalletPath;
}

const getDefaultNetworkIx = () => {
  return defaultNetworkIx;
}

const getCurrentNodeURL = () => {
  return currentNodeURL;
}

const setCurrentNodeURL = (_nodeURL) => {
  currentNodeURL = _nodeURL;
}

const getCurrentCurrency = () => {
  return currentCurrency;
}

const setCurrentCurrency = (_currency) => {
  currentCurrency = _currency.toLowerCase();
  CoinGecko.requestPriceData();
}

const createConfigFile = (readyCallback, errorCallback) => {    
  if (!fs.existsSync(configFilePath)) {  
    fs.writeFile(configFilePath, defaultConfigContent, "utf8", (err) => {
      if (err) {
        errorCallback(err);
      } else {
        readyCallback("File created");
      }      
    });
  }
}

const createConfigFileReady = (result) => {
  readConfigFile();
}

const createConfigFileError = (error) => {
  console.log(error);
}

const readConfigFile = () => {
  if (!configInitialized) {
    if (fs.existsSync(configFilePath)) {
      var data = fs.readFileSync(configFilePath,'utf8');
      var dataArr = data.split("\n");  
      dataArr.forEach(element => {
        var [item, value] = element.split("=");
        if (item.indexOf('currency') >= 0) configCurrency = value;
        if (item.indexOf('networkIx') >= 0) configNetworkIx = value;
        if (item.indexOf('nodeURL') >= 0) configNodeURL = value;
        if (item.indexOf('walletPath') >= 0) configWalletPath = value;
        if (item.indexOf('showBalance') >= 0) configShowBalance = value.toLowerCase() == "true" ? true : false;
        if (item.indexOf('advancedFeatures') >= 0) configAdvancedFeatures = value.toLowerCase() == "true" ? true : false;
        if (item.indexOf('contextMenu') >= 0) configContextMenu = value.toLowerCase() == "true" ? true : false;
        if (item.indexOf('lastWallet') >= 0) lastWallet = value;
        if (item.indexOf('developMode') >= 0) developMode = value.toLowerCase() == "true" ? true : false;
      });
      
      if (configCurrency.length > 0) {
        currentCurrency = configCurrency.toLowerCase();
      } else {
        currentCurrency = defaultCurrency.toLowerCase();
      }
      currentNodeURL = configNodeURL;      
      if (currentNodeURL.length > 0) {
        setRestService(99);
      } else {
        if (configNetworkIx.length > 0) {
          setRestService(configNetworkIx);
        } else {
          setRestService(defaultNetworkIx);
        }        
      }      
      if (configWalletPath.length > 0) {
        currentWalletPath = configWalletPath;
      } else {
        currentWalletPath = defaultWalletPath;
      }
      
      currentShowBalance = configShowBalance;
      currentAdvancedFeatures = configAdvancedFeatures;
      currentContextMenu = configContextMenu;
      configInitialized = true;
      //mainConsole.log(`Configuration file initialized.`);
    } else {
      createConfigFile(createConfigFileReady, createConfigFileError);
    }    
  }
}

const updateLastWallet = (_walletName) => {
  let updateConfigContent = "currency="+configCurrency+"\nnetworkIx="+configNetworkIx+"\nnodeURL="+configNodeURL+"\nwalletPath=\nshowBalance="+configShowBalance+"\nadvancedFeatures="+configAdvancedFeatures+"\ncontextMenu="+configContextMenu+"\nlastWallet="+_walletName;
  if (developMode) updateConfigContent +="\ndevelopMode="+developMode;
  fs.writeFile(configFilePath, updateConfigContent, "utf8", (err) => {
    if (err) throw err;
    return true;
  });
}

const updateConfigFile = (updateCurrency, updateNetworkIx, updateNodeURL, updateWalletPath, updateShowBalance, updateAdvancedFeatures, updateContextMenu) => {
  let updateConfigContent = '';
  updateConfigContent += "currency="+updateCurrency.toLowerCase()
  updateConfigContent += "\nnetworkIx="+updateNetworkIx
  updateConfigContent += "\nnodeURL="+updateNodeURL
  updateConfigContent += "\nwalletPath="+updateWalletPath
  updateConfigContent += "\nshowBalance="+updateShowBalance
  updateConfigContent += "\nadvancedFeatures="+updateAdvancedFeatures;  
  updateConfigContent += "\ncontextMenu="+updateContextMenu;  
  updateConfigContent += "\nlastWallet="+lastWallet;
  if (developMode) updateConfigContent +="\ndevelopMode="+developMode;
  
  fs.writeFile(configFilePath, updateConfigContent, "utf8", (err) => {
  if (err) throw err;
    bannerStatus = `Configuration file was saved successfully.`;
    bannerClass = 'bg_green color_white banner-look';    
    GuiToggles.showAllBanners(true);
    
    currentCurrency = updateCurrency;
    currentNetworkIx = updateNetworkIx;
    currentNodeURL = updateNodeURL;
    if (currentNodeURL.length > 0) {
      setRestService(99);
    } else {
      setRestService(0);
    }    
    if (updateWalletPath.length > 0) {
      currentWalletPath = updateWalletPath;
    } else {
      currentWalletPath = defaultWalletPath;
    }
    currentShowBalance = updateShowBalance;
    currentAdvancedFeatures = updateAdvancedFeatures;
    currentContextMenu = updateContextMenu;
    
    configInitialized = false;
    readConfigFile();
    
    renderApp();
    return true;
  });
}

const retrieveCryptoName = async () => {
  if (sendToAddress === "") {
    bannerStatus = `Please enter CryptoName into ELA Address field.`;
    bannerClass = `bg_red color_white banner-look`;
    GuiToggles.showAllBanners(false);    
  } else {
    if (isValidAddress(sendToAddress)) {
      bannerStatus = `Entered address is already valid ELA Address.`;
      bannerClass = 'landing-btnbg color_white banner-look';
      GuiToggles.showAllBanners(true);
    } else {
      await fetchCryptoName();  
      if (!isValidAddress(cryptoNameELAAddress)) {
        bannerStatus = `ELA Address for [`+sendToAddress+`] does not exist or service is unavailable.`;
        bannerClass = 'bg_red color_white banner-look';
        GuiToggles.showAllBanners(false);
      } else {
        bannerStatus = `ELA Address [`+cryptoNameELAAddress+`] for [`+sendToAddress+`] was received.`;
        bannerClass = `bg_green color_white banner-look`;
        GuiToggles.showAllBanners(true);
        GuiUtils.setValue('sendToAddress', cryptoNameELAAddress);
        sendToAddress = cryptoNameELAAddress;
      }
    }
  }
  renderApp();
}

const fetchCryptoName = async () => {
  sendToAddress = GuiUtils.getValue('sendToAddress');
  const url = "https://"+sendToAddress+".elastos.name/ela.address";
  cryptoNameELAAddress = await fetch(url).then(function (response) {
    return response.text();
  }).then(function (html) {
      return html 
  }).catch(function (err) {
    console.warn('Unable to fetch data.', err);
  });
}

const getCurrentWalletPath = () => {
  return currentWalletPath;
}

const getCurrentShowBalance = () => {
  return currentShowBalance;
}

const setCurrentShowBalance = (_currentShowBalance) => {
  currentShowBalance = _currentShowBalance;
}

const getCurrentAdvancedFeatures = () => {
  return currentAdvancedFeatures;
}

const setAdvancedFeatures = (_setAdvancedFeatures) => {
  setAdvancedFeatures = _setAdvancedFeatures;
}

const getDefaultAdvancedFeatures = () => {
  return defaultAdvancedFeatures;
}

const setCurrentAdvancedFeatures = (_currentAdvancedFeatures) => {
  currentAdvancedFeatures = _currentAdvancedFeatures;
}

const getCurrentContextMenu = () => {
  return currentContextMenu;
}

const setContextMenu = (_setContextMenu) => {
  setContextMenu = _setContextMenu;
}

const getDefaultContextMenu = () => {
  return defaultContextMenu;
}

const setCurrentContextMenu = (_currentContextMenu) => {
  currentContextMenu = _currentContextMenu;
}

const resetConfigInitialized = () => {
  configInitialized = false;
}

const getWalletNameLogin = () => {
  return walletNameLogin;
}

const getWalletNameCreate = () => {
  return walletNameCreate;
}

const getConfigNetworkIx = () => {
  return configNetworkIx;
}

const getConfigNodeURL = () => {
  return configNodeURL;
}

const getConfigCurrency = () => {
  return configCurrency;
}

const getConfigWalletPath = () => {
  return configWalletPath;
}

const getConfigShowBalance = () => {
  return configShowBalance;
}

const getConfigAdvancedFeatures = () => {
  return configAdvancedFeatures;
}

const getConfigContextMenu = () => {
  return configContextMenu;
}

const getTotalUTXOs = () => {
  return parsedUnspentTransactionOutputs.length;
}

const getMaxUTXOsPerTX = () => {
  if (useLedgerFlag) {
    return LEDGER_UTXO_CONSOLIDATE_COUNT;
  } else {
    return MAX_UTXO_CONSOLIDATE_COUNT;
  }
}

const getInitTxRecordsCount = () => {
  return initTxRecordsCount;
}

const getTxRecordsCount = () => {
  return txRecordsCount;
}

const setTxRecordsCount = (_txRecordsCount) => {
  txRecordsCount = _txRecordsCount;
}

const getLoadedProducerList = () => {
  return loadedProducerList;
}

const getLoadedVotes = () => {
  return loadedVotes;
}

const getDevelopMode = () => {
  return developMode;
}

const getCreateScreen = () => {
  return createScreen;
}

const setCreateScreen = (_createScreen) => {
  createScreen = _createScreen;
}

const getPassphraseFlag = () => {
  return usePassphraseFlag;
}

const getDerivationPathExport = () => {
  return derivationPathExport;
}

const getMnemonicExport = () => {
  return mnemonicExport;
}

const showBanner = (_bannerStatus, _bannerClass, _timer) => {
  bannerStatus = _bannerStatus;
  bannerClass = _bannerClass;
  GuiToggles.showAllBanners(_timer);
}

const getPasswordRegEx = () => {
  return passwordRegEx;
}

const getTXDetails = (_txID) => {
  let txDetail = parsedTransactionHistory.filter(tx => tx.txHash === _txID);
  //console.log(JSON.stringify(selectedUTXOs));
  return txDetail;
}

const getLastWallet = () => {
  return lastWallet;
}

const getMaxCandidates = () => {
  return maxCandidates;
}

const toggleUTXOControl = (_utxoIx) => {
  const selectUTXO = parsedUnspentTransactionOutputs.find(element => element.utxoIx === _utxoIx);
  //console.log(_utxoIx, JSON.stringify(selectUTXO));
  if (!checkUTXO(selectUTXO.utxoIx)) {
    selectedUTXOs.push(selectUTXO);
  } else {
    for(var i = 0; i < selectedUTXOs.length; i++) {
      if (selectedUTXOs[i] === selectUTXO) {
        selectedUTXOs.splice(i, 1);
      }
    }
  }
  // mainConsole.log('toggleUTXOControl selectedUTXOs, count', selectedUTXOs, selectedUTXOs.length);
  renderApp();
};

const getAllUTXOs = () => {
  return parsedUnspentTransactionOutputs;
}

const validateUTXOsSelection = () => {
  if (selectedUTXOs.length > getMaxUTXOsPerTX()) {
    bannerStatus = 'You have selected more than ['+getMaxUTXOsPerTX()+'] UTXOs, please select less.';
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }
  
  /*if (selectedUTXOs.length === 0) {
    bannerStatus = 'You have not selected any UTXOs, please select at least 1.';
    bannerClass = 'bg_red color_white banner-look';
    GuiToggles.showAllBanners(false);
    renderApp();
    return false;
  }*/
  return true;
}
  
const checkUTXO = (_utxoIx) => {
  let matchUTXO = false;
  if (selectedUTXOs.length > 0) {
    selectedUTXOs.forEach((_utxo) => {
      if (_utxo.utxoIx === _utxoIx) {
        matchUTXO = true;
      }
    });
  }
  return matchUTXO;
}

const selectMaxUTXOs = (_sort, _direction) => {
  clearUTXOsSelection();
  let tempUTXOs = parsedUnspentTransactionOutputs;
  selectedUTXOs = tempUTXOs.sort(_sort === "index" ? (({utxoIx: previousutxoIx}, {utxoIx: currentutxoIx}) => _direction === "asc" ? previousutxoIx - currentutxoIx : currentutxoIx - previousutxoIx) : (({Value: previousValue}, {Value: currentValue}) => _direction === "asc" ? previousValue - currentValue : currentValue - previousValue)).slice(0, getMaxUTXOsPerTX());
}

const getSelectedUTXOs = () => {
  return selectedUTXOs;
}

const getCustomUTXOs = () => {
  return customUTXOs;
}

const setCustomUTXOs = (_customUTXOs) => {
  customUTXOs = _customUTXOs;
}

/* basic */
exports.REST_SERVICES = REST_SERVICES;
exports.init = init;
exports.log = mainConsole.log;
exports.trace = mainConsole.trace;
exports.renderApp = renderAppWrapper;
exports.setAppClipboard = setAppClipboard;
exports.setAppDocument = setAppDocument;
exports.setRenderApp = setRenderApp;
exports.getLedgerDeviceInfo = getLedgerDeviceInfo;
exports.getMainConsole = getMainConsole;
exports.requestBlockchainData = requestBlockchainData;
exports.clearSendData = clearSendData;
exports.clearGlobalData = clearGlobalData;
exports.setPollForAllInfoTimer = setPollForAllInfoTimer;
exports.getPublicKeyFromMnemonic = getPublicKeyFromMnemonic;
exports.getPublicKeyFromPrivateKey = getPublicKeyFromPrivateKey;
exports.getAddress = getAddress;
exports.getELABalance = getELABalance;
exports.getCurrencyBalance = getCurrencyBalance;
exports.getParsedProducerList = getParsedProducerList;
exports.getProducerListStatus = getProducerListStatus;
exports.getParsedTransactionHistory = getParsedTransactionHistory;
exports.getBlockchainState = getBlockchainState;
exports.getConfirmations = getConfirmations;
exports.getBlockchainStatus = getBlockchainStatus;
exports.getTransactionHistoryStatus = getTransactionHistoryStatus;
exports.checkTransactionHistory = checkTransactionHistory;
exports.getSendToAddressStatuses = getSendToAddressStatuses;
exports.getSendToAddressLinks = getSendToAddressLinks;
exports.getSendAmount = getSendAmount;
exports.getFeeAmountEla = getFeeAmountEla;
exports.getSendToAddress = getSendToAddress;
exports.getFeeAmountSats = getFeeAmountSats;
exports.getTxMemo = getTxMemo;
exports.getSendStep = getSendStep;
exports.setSendStep = setSendStep;
exports.sendAmountToAddress = sendAmountToAddress;
exports.getRestService = getRestService;
exports.setRestService = setRestService;
exports.changeNodeURL = changeNodeURL;
exports.resetNodeURL = resetNodeURL;
exports.getCandidateVoteListStatus = getCandidateVoteListStatus;
exports.getParsedCandidateVoteList = getParsedCandidateVoteList;
exports.toggleProducerSelection = toggleProducerSelection;
exports.sendVoteTx = sendVoteTx;
exports.getAddressOrBlank = getAddressOrBlank;
exports.getParsedRssFeed = getParsedRssFeed;
exports.getBannerStatus = getBannerStatus;
exports.getBannerClass = getBannerClass;
exports.getFee = getFee;
exports.generateMnemonic = generateMnemonic;
exports.getGeneratedMnemonic = getGeneratedMnemonic;
exports.copyMnemonicToClipboard = copyMnemonicToClipboard;
exports.generatePrivateKeyHex = generatePrivateKeyHex;
exports.getGeneratedPrivateKeyHex = getGeneratedPrivateKeyHex;
exports.copyPrivateKeyToClipboard = copyPrivateKeyToClipboard;
exports.copyAddressToClipboard = copyAddressToClipboard;
/* Producers & Candidates */
exports.reloadProducersAndVotes = reloadProducersAndVotes;
exports.requestListOfProducers = requestListOfProducers;
exports.requestListOfCandidateVotes = requestListOfCandidateVotes;
exports.verifyLedgerBanner = verifyLedgerBanner;
exports.getLoadedProducerList = getLoadedProducerList;
//exports.formatTxValue = formatTxValue;
exports.selectActiveVotes = selectActiveVotes;
exports.clearSelection = clearSelection;
exports.clearUTXOsSelection = clearUTXOsSelection;
exports.validateInputs = validateInputs;
exports.validateFee = validateFee;
exports.insertELA = insertELA;
exports.getTotalSpendingELA = getTotalSpendingELA;
exports.isValidAddress = isValidAddress;
exports.isValidDecimal = isValidDecimal;
exports.showBanner = showBanner;
/* Wallets */
exports.getPublicKeyFromLedger = getPublicKeyFromLedger;
exports.isLedgerConnected = isLedgerConnected;
exports.encryptWallet = encryptWallet;
exports.decryptWallet = decryptWallet;
exports.createWalletFile = createWalletFile;
exports.readWalletFile = readWalletFile;
exports.removeWalletFile = removeWalletFile;
exports.loginWithWallet = loginWithWallet;
exports.listWalletFiles = listWalletFiles;
exports.getPasswordFlag = getPasswordFlag;
exports.saveWalletLocally = saveWalletLocally;
exports.createWalletFolder = createWalletFolder;
exports.getLoggedIn = getLoggedIn;
exports.getWalletNameLogin = getWalletNameLogin;
exports.getWalletNameCreate = getWalletNameCreate;
/* config */
//exports.resetConfigInitialized = resetConfigInitialized;
exports.createConfigFile = createConfigFile;
exports.readConfigFile = readConfigFile;
exports.updateConfigFile = updateConfigFile;
exports.getConfigNetworkIx = getConfigNetworkIx;
exports.getConfigNodeURL = getConfigNodeURL;
exports.getConfigCurrency = getConfigCurrency;
exports.getConfigWalletPath = getConfigWalletPath;
exports.getConfigShowBalance = getConfigShowBalance;
exports.getConfigAdvancedFeatures = getConfigAdvancedFeatures;
exports.getConfigContextMenu = getConfigContextMenu;
/* current */
exports.getCurrentNetworkIx = getCurrentNetworkIx;
exports.getCurrentNodeURL = getCurrentNodeURL;
exports.setCurrentNodeURL = setCurrentNodeURL;
exports.getCurrentCurrency = getCurrentCurrency;
exports.setCurrentCurrency = setCurrentCurrency;
exports.getCurrentWalletPath = getCurrentWalletPath;
exports.setCurrentWalletPath = setCurrentWalletPath;
exports.getCurrentShowBalance = getCurrentShowBalance;
exports.setCurrentShowBalance = setCurrentShowBalance;
exports.getCurrentAdvancedFeatures = getCurrentAdvancedFeatures;
exports.setCurrentAdvancedFeatures = setCurrentAdvancedFeatures;
exports.getCurrentContextMenu = getCurrentContextMenu;
exports.setCurrentContextMenu = setCurrentContextMenu;
/* default */
exports.getDefaultWalletPath = getDefaultWalletPath;
exports.getDefaultNetworkIx = getDefaultNetworkIx;
/* consolidate */
exports.consolidateUTXOs = consolidateUTXOs;
exports.showConsolidateButton = showConsolidateButton;
exports.getTotalUTXOs = getTotalUTXOs;
exports.getMaxUTXOsPerTX = getMaxUTXOsPerTX;
/* others */
exports.getTxRecordsCount = getTxRecordsCount;
exports.setTxRecordsCount = setTxRecordsCount;
exports.getInitTxRecordsCount = getInitTxRecordsCount;
exports.getDevelopMode = getDevelopMode;
exports.getCreateScreen = getCreateScreen;
exports.setCreateScreen = setCreateScreen;
exports.getMnemonicExport = getMnemonicExport;
exports.getPassphraseFlag = getPassphraseFlag;
exports.getDerivationPathExport = getDerivationPathExport;
exports.exportMnemonic = exportMnemonic;
exports.changePassword = changePassword;
exports.getPasswordRegEx = getPasswordRegEx;
exports.retrieveCryptoName = retrieveCryptoName;
exports.getTXDetails = getTXDetails;
exports.clearRequests = clearRequests;
exports.listRequests = listRequests;
exports.writeSendData = writeSendData;
exports.getJson = getJson;
exports.parseCurrencyList = parseCurrencyList;
exports.getParsedFiatList = getParsedFiatList;
exports.getParsedCryptoList = getParsedCryptoList;
exports.getLastWallet = getLastWallet;
exports.getVoteValue = getVoteValue;
exports.getMaxCandidates = getMaxCandidates;
exports.enableContextMenu = enableContextMenu;
exports.disableContextMenu = disableContextMenu;
exports.toggleUTXOControl = toggleUTXOControl;
exports.getAllUTXOs = getAllUTXOs;
exports.getSelectedUTXOs = getSelectedUTXOs;
exports.checkUTXO = checkUTXO;
exports.getTransactionHistoryLink = getTransactionHistoryLink;
exports.getCustomUTXOs = getCustomUTXOs;
exports.setCustomUTXOs = setCustomUTXOs;
exports.validateUTXOsSelection = validateUTXOsSelection;
exports.selectMaxUTXOs = selectMaxUTXOs;
