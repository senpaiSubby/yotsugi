import React from 'reactn'
import TitleBar from '../TitleBar/TitleBar'
import CommandButtons from '../CommandButtons/CommandButtons'
import AddCommand from '../CommandButtons/AddCommand'

const App = () => {
  return (
    <div className="App">
      <TitleBar />
      <CommandButtons />
      <AddCommand />
    </div>
  )
}

export default App
