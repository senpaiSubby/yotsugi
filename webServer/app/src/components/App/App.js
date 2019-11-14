import React from 'react'
import TitleBar from '../TitleBar/TitleBar'
import CommandButtons from '../CommandButtons/CommandButtons'
import AddCommand from '../CommandButtons/AddCommand'
import SettingsMenu from '../SettingsMenu/SettingsMenu'

const App = () => {
  return (
    <div className="App">
      <TitleBar />
      <AddCommand />
      <CommandButtons />
    </div>
  )
}

export default App
