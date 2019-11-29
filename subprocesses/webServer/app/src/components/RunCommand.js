import React, { useState } from 'reactn'
import { sendCommand } from './Utils'

const RunCommand = () => {
  const [command, setCommand] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    await sendCommand(command)
    setCommand('')
  }

  return (
    <form
      autoComplete="off"
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: '5px',
        padding: '10px',
        gridTemplateColumns: '250px 50px'
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
          height: '30px'
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
          backgroundColor: '#3E4245',
          color: '#757163',
          height: '30px'
        }}
        value="Run"
      />
    </form>
  )
}
export default RunCommand
