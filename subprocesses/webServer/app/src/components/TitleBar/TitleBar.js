import React, { useEffect, useState } from 'reactn'
import { toast, Flip } from 'react-toastify'

const TitleBar = () => {
  const [data, setData] = useState('')
  const [command, setCommand] = useState('')

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

  useEffect(() => {
    fetch('/api/info')
      .then((response) => response.json())
      .then((data) => setData(data))

    const interval = setInterval(() => {
      fetch('/api/info')
        .then((response) => response.json())
        .then((data) => setData(data))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkStatusCode = (status) => {
    switch (status) {
      case 0:
        return 'Ready'
      case 1:
        return 'Connecting'
      case 2:
        return 'Reconnecting'
      case 3:
        return 'Idle'
      case 4:
        return 'Nearly'
      case 5:
        return 'Disconnected'
      default:
        break
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command })
      })
      const data = await response.json()
      setCommand('')
      return notify(data.response)
    } catch {
      return notify('There was an error connecting.')
    }
  }

  return (
    <div className="TitleBar">
      <div
        style={{
          display: 'grid',
          alignItems: 'center',
          gap: '5px',
          gridTemplateColumns: 'auto auto'
        }}
      >
        <img
          src={data ? `${data.avatar}` : ''}
          alt=".."
          style={{ width: '48px', height: '48px' }}
        />
        <span>
          {data ? `${data.username}` : '..'}
          <br />
          {data ? `${checkStatusCode(data.status)} ${data.upTime}` : '..'}
        </span>
      </div>

      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '5px',
          gridTemplateColumns: '125px 50px'
        }}
      >
        <input
          type="text"
          style={{
            width: '125px',
            border: 'none',
            fontSize: '0.7rem',
            backgroundColor: '#3E4245',
            color: '#757163',
            textAlign: 'center',
            height: '45px'
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
            height: '45px'
          }}
          value="Run"
        />
      </form>
    </div>
  )
}

export default TitleBar
