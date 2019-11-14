import React, { useEffect, useState } from 'react'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { capitalize } from '../utils'
import { ToastContainer, toast, Slide } from 'react-toastify'
import '../../../node_modules/react-toastify/dist/ReactToastify.css'

const CommandButtons = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/ui/db')
      .then((response) => response.json())
      .then((data) => {
        setData(data.uiButtons)
      })
  }, [])

  const notify = (message) =>
    toast(message, {
      position: 'bottom-center',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'toast',
      transition: Slide
    })
  /*
const lightSlider = async (command, value) => {
  try {
    const data = await sendCommand(`${command} ${value}`)
    return notify(data.response)
  } catch (error) {
    console.log(error)
  }
}
*/
  const sendCommand = async (command) => {
    const postData = {
      apiKey: 284695,
      command: command
    }
    try {
      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      const data = await response.json()
      return notify(capitalize(data.response))
    } catch {
      return notify('There was an error connecting.')
    }
  }
  const removeButton = async (id) => {
    await fetch(`http://127.0.0.1:5700/ui/db/rm/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    setData(null)
  }

  const renderedButtons = data
    ? data.map((item, index) => {
        const { id, name, command } = item
        return (
          <div key={index}>
            <ContextMenuTrigger id={id}>
              <button className="apiButton" onClick={async () => await sendCommand(command)}>
                {name}
              </button>
            </ContextMenuTrigger>
            <ContextMenu id={id}>
              <MenuItem data={{ foo: 'bar' }} onClick={async () => await removeButton(id)}>
                Delete
              </MenuItem>
            </ContextMenu>
          </div>
        )
      })
    : 'No shortcut commands set. Please add one above.'

  return (
    <div className="apiButtons">
      {renderedButtons}

      <ToastContainer />
    </div>
  )
}

export default CommandButtons
