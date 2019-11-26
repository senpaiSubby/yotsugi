import React, { useState } from 'react'

const AddCommand = () => {
  const [commandName, setCommandName] = useState()
  const [command, setCommand] = useState()

  const handleSubmit = async (event) => {
    event.preventDefault()

    fetch('/ui/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([commandName, command])
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        padding: '10px',
        gap: '5px',
        gridTemplateColumns: '200px 200px 50px'
      }}
    >
      <input
        type="text"
        style={{
          width: '200px',
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
          width: '200px',
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
        value="Add"
      />
    </form>
  )
}

export default AddCommand
