import React, { useState, useGlobal } from 'reactn'
import { notify } from '../../../Utils/Utils'

const AddCommand = () => {
  const [commandName, setCommandName] = useState('')
  const [command, setCommand] = useState('')
  const [state, setState] = useGlobal('state')

  const handleSubmit = async (e) => {
    e.preventDefault()

    fetch('/api/db/ui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([commandName, command])
    })
    notify(`Added [Name: ${commandName} ] [Command: ${command} ]`)
    setCommand('')
    setCommandName('')
    setState(state - 1)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Add Command</span>
      <form className="SettingsEntryForm" autoComplete="off" onSubmit={handleSubmit}>
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="Name"
          name="commandName"
          value={commandName}
          required={true}
          onChange={(e) => setCommandName(e.target.value)}
        />
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="Command"
          name="command"
          value={command}
          required={true}
          onChange={(e) => setCommand(e.target.value)}
        />
        <input className="SettingsEntryInput" type="submit" value="+" />
      </form>
    </div>
  )
}

export default AddCommand
