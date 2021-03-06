const React = require('react');

module.exports = (props) => {
  const App = props.App;
  const GuiToggles = props.GuiToggles;
  
  const showVoting = () => {
    GuiToggles.showVoting();
  }
  
  return (

  <div id="staking" className="dark-hover2" onMouseDown={(e) => showVoting()}>
    <p className="stakingtitle cursor_def">staking</p>
    <p className="candidate-total cursor_def">{App.getParsedProducerList().producers.length} candidates total</p>
    <p className="candidate-voted cursor_def">{App.getParsedCandidateVoteList().candidateVotes.length}/{App.getMaxCandidates()} Active Votes</p>
    <p className="votenow gradient-font cursor_def" onClick={(e) => showVoting()} >Vote now</p>
    <img src="artwork/arrow.svg" alt="" className="arrow-right" />
  </div>

  )
  }
