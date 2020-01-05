import React, { useEffect, useGlobal } from 'reactn'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { sendCommand } from '../Utils/Utils'

import './CommandButtons.css'

const CommandButtons = () => {
  const [commandList, setCommandList] = useGlobal('commandList')
  const [state, setState] = useGlobal('state')

  useEffect(() => {
    fetch('/api/db/ui')
      .then((response) => response.json())
      .then((data) => setCommandList(data))
    setState(1)
    // eslint-disable-next-line
  }, [state])

  const removeButton = async (id) => {
    setState(state + 1)
    await fetch(`/api/db/ui/rm/${id}`, { method: 'POST' })
  }

  const renderedButtons = commandList
    ? commandList.map((item, index) => {
        const { id, name, command } = item
        return (
          <div key={index}>
            <ContextMenuTrigger id={id}>
              <button className="CommandButton" onClick={async () => await sendCommand(command)}>
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

  return <div className="CommandButtonContainer">{renderedButtons}</div>
}

export default CommandButtons
