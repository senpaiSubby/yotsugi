import React from 'reactn'
import Settings from './Settings/Settings'
import RunCommand from './RunCommand'
import BotInfo from './BotInfo'

const TitleBar = () => {
  return (
    <div className="TitleBar">
      <BotInfo />
      <Settings />
      <RunCommand />
    </div>
  )
}

export default TitleBar
