import React, { useState, useGlobal } from 'reactn'
import { notify } from '../../Utils'

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
    notify(`Added [ ${commandName} - ${command} ]`)
    setCommand('')
    setCommandName('')
    setState(state - 1)
  }

  return (
    <div>
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '5px',
          gridTemplateColumns: '125px 125px 50px',
          paddingBottom: '5px'
        }}
      >
        <input
          type="text"
          style={{
            border: 'none',
            fontSize: '0.7rem',
            backgroundColor: '#3E4245',
            color: '#dfdfdf',
            textAlign: 'center',
            height: '35px'
          }}
          placeholder="Name"
          name="commandName"
          value={commandName}
          required={true}
          onChange={(e) => setCommandName(e.target.value)}
        />
        <input
          type="text"
          style={{
            border: 'none',
            fontSize: '0.7rem',
            backgroundColor: '#3E4245',
            color: '#dfdfdf',
            textAlign: 'center',
            height: '35px'
          }}
          placeholder="Command"
          name="command"
          value={command}
          required={true}
          onChange={(e) => setCommand(e.target.value)}
        />
        <input
          type="submit"
          style={{
            border: 'none',
            fontSize: '0.7rem',
            padding: '0px 5px',
            backgroundColor: '#3E4245',
            color: '#757163',
            height: '35px'
          }}
          value="+"
        />
      </form>
    </div>
  )
}

export default AddCommand
