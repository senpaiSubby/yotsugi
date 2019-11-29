import React, { useEffect, useGlobal } from 'reactn'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { ToastContainer, toast, Flip } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const CommandButtons = () => {
  const [commandList, setCommandList] = useGlobal('commandList')

  useEffect(() => {
    fetch('/api/db/ui')
      .then((response) => response.json())
      .then((data) => setCommandList(data))
  }, [])

  const notify = (message) =>
    toast(message, {
      position: 'bottom-center',
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'toast',
      transition: Flip
    })

  const sendCommand = async (command) => {
    try {
      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })
      const data = await response.json()
      return notify(data.response)
    } catch {
      return notify('There was an error connecting.')
    }
  }
  const removeButton = async (id) => {
    return fetch(`/api/db/ui/rm/${id}`, { method: 'POST' })
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
    : 'No shortcut commands set. Please add one below.'

  return (
    <div className="apiButtons">
      {renderedButtons}
      <ToastContainer closeButton={false} />
    </div>
  )
}

export default CommandButtons
