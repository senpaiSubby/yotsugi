import React from 'reactn'
import './App.css'

import TitleBar from '../TitleBar/TitleBar'
import Main from '../Main/Main'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className="App">
      <TitleBar />
      <Main />
      <ToastContainer closeButton={false} />
    </div>
  )
}

export default App
