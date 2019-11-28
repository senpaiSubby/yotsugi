import React, { useEffect, useGlobal } from 'reactn'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { ToastContainer, toast, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const CommandButtons = () => {
  const [commandList, setCommandList] = useGlobal('commandList')

  useEffect(() => {
    fetch('/ui/db')
      .then((response) => response.json())
      .then((data) => {
        setCommandList(data)
      })
  })

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

  const sendCommand = async (command) => {
    const postData = { command: command }

    try {
      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      const data = await response.json()
      return notify(data.response)
    } catch {
      return notify('There was an error connecting.')
    }
  }
  const removeButton = async (id) => {
    await fetch(`/ui/db/rm/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    setCommandList(null)
  }

  const renderedButtons = commandList
    ? commandList.map((item, index) => {
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
