const React = require('react');

let showUTXOs = '';
let sort = "index";
let direction = "asc";

module.exports = (props) => {
  const App = props.App;
  showUTXOs = props.showUTXOs;
  const closeModal = props.closeModal;
  const UTXOControl = props.UTXOControl;
  const UTXOControlNext = props.UTXOControlNext;
  
  const UTXOControlButtonText = (props) => {
    const item = props.item;
    if (App.checkUTXO(item.utxoIx)) {
      return (<img src="artwork/check-square.svg" />)
    } else {
      return (<img src="artwork/square.svg" />)
    }
  }
  
  const sortIndex = () => {
    if (sort === "value") {
      direction = "asc" // default for Index
    } else {
      if (direction === "asc") {direction = "desc"}
      else {direction = "asc"}        
    }
    sort = "index";
    App.renderApp();
    //console.log("Sort index", direction);
  }
  
  const sortValue = () => {
    if (sort === "index") {
      direction = "desc" // default for Value
    } else {
      if (direction === "asc") {direction = "desc"}
      else {direction = "asc"}  
    }
    sort = "value";
    App.renderApp();
    //console.log("Sort value", direction);
  }
  
  return (
    <div className="bg-modal" style={showUTXOs ? {display: 'flex'} : {display: 'none'}}>    
      <a onClick={(e) => closeModal()}></a>
      <div className="modalContent w550px h350px">
        <div className="utxo-title">
          <span className="address-text font_size20 gradient-font">UTXO Control</span>
        </div>
        <div className="utxo-status utxo-status-font">{App.getSelectedUTXOs().length}/{App.getTotalUTXOs()}<br /><span className="utxo-status-font-max">max. {App.getMaxUTXOsPerTX()}</span></div>
        <div className="closeModal" onClick={(e) => closeModal()}>
          <img className="scale-hover" src="artwork/voting-back.svg" height="38px" width="38px"/>
        </div>
        <div className="utxo-tablediv scrollbar">
          <table className="utxo-table">
            <tbody>
              <tr className="txtable-headrow">
                <td className="w100px cursor_def" onClick={() => sortIndex()}>Index<span style={sort === "index" ? {display: 'inline-block'} : {display: 'none'}} className={direction === "asc" ? "sort-arrow down" : "sort-arrow up"}></span></td>
                <td className="w175px">Tx ID</td>
                <td className="w175px cursor_def" onClick={() => sortValue()}>Value<span style={sort === "value" ? {display: 'inline-block'} : {display: 'none'}} className={direction === "asc" ? "sort-arrow down" : "sort-arrow up"}></span></td>
                <td className="w50px">Select</td>
              </tr>
              {
                App.getAllUTXOs().slice(0, App.getAllUTXOs().count).sort(sort === "index" ? (({utxoIx: previousutxoIx}, {utxoIx: currentutxoIx}) => direction === "asc" ? previousutxoIx - currentutxoIx : currentutxoIx - previousutxoIx) : (({Value: previousValue}, {Value: currentValue}) => direction === "asc" ? previousValue - currentValue : currentValue - previousValue)).map((item, index) => {
                  return (<tr className={App.checkUTXO(item.utxoIx) ? 'txtable-row voting-selected ': 'txtable-row voting-hover'} key={index} onClick={(e) => App.toggleUTXOControl(item.utxoIx)}>
                    <td>{item.utxoIx}</td>
                    <td>{item.Txid.substring(0, 15) + '...'}</td>
                    <td>{item.Value}</td>
                    <td>
                      <UTXOControlButtonText item={item}/>
                    </td>                  
                  </tr>)
                })
              }
            </tbody>
          </table>
        </div>
        <div className="utxo-footer">
          <button className='utxo-clear utxo-grey-button scale-hover' title='Clear Selection' onClick={() => App.clearUTXOsSelection()}>Clear Selection</button>
          <button className='utxo-max-select utxo-grey-button scale-hover' title='Select Max UTXOs' onClick={() => App.selectMaxUTXOs(sort, direction)}>Select Max</button>
          <button className="utxo-confirm submitModal scale-hover" onClick={() => UTXOControlNext()}>Save</button>
        </div>
      </div>
    </div>
  );
}
