import React, { useEffect, useState } from 'react'

const TitleBar = () => {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/info')
      .then((response) => response.json())
      .then((data) => {
        setData(data)
      })
    const interval = setInterval(() => {
      fetch('/api/info')
        .then((response) => response.json())
        .then((data) => {
          setData(data)
        })
    }, 2000)
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
  const checkPresence = (code) => {
    switch (code) {
      case 0:
        return 'Playing'
      case 1:
        return 'Streaming'
      case 2:
        return 'Listening'
      case 3:
        return 'Watching'
      default:
        break
    }
  }
  return (
    <div className="TitleBar">
      <div
        style={{
          display: 'grid',
          alignItems: 'center',
          gap: '10px',
          gridTemplateColumns: 'auto auto'
        }}
      >
        <img
          src={data ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatarId}.png` : ''}
          alt=".."
          style={{ width: '48px', height: '48px' }}
        />
        <span>
          {data
            ? `${data.username} - ${checkPresence(data.presence.type)} ${data.presence.name}`
            : '..'}
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          alignItems: 'center',
          gap: '10px',
          gridTemplateColumns: 'auto auto'
        }}
      >
        <span>{data ? checkStatusCode(data.status) : '..'}</span>
        <span>{data ? data.upTime : '..'}</span>
      </div>
    </div>
  )
}

export default TitleBar
