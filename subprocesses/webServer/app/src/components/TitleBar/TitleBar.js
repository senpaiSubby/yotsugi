import React from 'reactn'
import Settings from './Settings/Settings'
import BotInfo from './BotInfo'

const TitleBar = () => {
  return (
    <div className="TitleBar">
      <BotInfo />
      <Settings />
    </div>
  )
}

export default TitleBar
