import React, { useEffect, useGlobal } from 'reactn'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { sendCommand } from '../Utils'

const CommandButtons = () => {
  const [commandList, setCommandList] = useGlobal('commandList')

  useEffect(() => {
    fetch('/api/db/ui')
      .then((response) => response.json())
      .then((data) => setCommandList(data))
  }, [commandList, setCommandList])

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

  return <div className="apiButtons">{renderedButtons}</div>
}

export default CommandButtons
