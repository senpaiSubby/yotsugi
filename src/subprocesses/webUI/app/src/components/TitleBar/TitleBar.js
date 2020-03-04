import Settings from './Settings/Settings'
import RunCommand from './RunCommand/RunCommand'
import BotInfo from './BotInfo'

import './TitleBar.css'

const TitleBar = () => {
  return (
    <div className="TitleBar">
      <BotInfo />
      <div style={{ display: 'grid', gridGap: '5px', gridTemplateColumns: 'auto auto' }}>
        <RunCommand />
        <Settings />
      </div>
    </div>
  )
}

export default TitleBar
