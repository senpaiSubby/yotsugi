import React, { useState } from 'reactn'

const AddCommand = () => {
  const [commandName, setCommandName] = useState('')
  const [command, setCommand] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    fetch('/api/db/ui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([commandName, command])
    })

    setCommand('')
    setCommandName('')
  }

  return (
    <div>
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '5px',
          gridTemplateColumns: '150px 150px 50px',
          paddingBottom: '5px'
        }}
      >
        <input
          type="text"
          style={{
            width: '150px',
            border: 'none',
            fontSize: '0.7rem',
            backgroundColor: '#3E4245',
            color: '#757163',
            textAlign: 'center',
            height: '20px'
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
            width: '150px',
            border: 'none',
            fontSize: '0.7rem',
            backgroundColor: '#3E4245',
            color: '#757163',
            textAlign: 'center',
            height: '20px'
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
            height: '20px'
          }}
          value="+"
        />
      </form>
    </div>
  )
}

export default AddCommand
