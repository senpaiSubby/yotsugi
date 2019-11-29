import React from 'reactn'

import TitleBar from './TitleBar/TitleBar'
import Main from './Main/Main'
import CommandButtons from './Main/CommandButtons'
import RunCommand from './RunCommand'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="App">
      <TitleBar />
      <CommandButtons />
      <RunCommand />
      <ToastContainer closeButton={false} />
    </div>
  )
}

export default App
