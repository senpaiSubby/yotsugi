import React from 'reactn'

import TitleBar from '../TitleBar/TitleBar'
import CommandButtons from '../CommandButtons/CommandButtons'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="App">
      <TitleBar />
      <CommandButtons />
      <ToastContainer closeButton={false} />
    </div>
  )
}

export default App
