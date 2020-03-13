import { useEffect, useState } from 'reactn'

const BotInfo = () => {
  const [data, setData] = useState('')

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

  return (
    <div
      style={{
        display: 'grid',
        alignItems: 'center',
        gap: '5px',
        gridTemplateColumns: 'auto auto'
      }}
    >
      <img src={data ? `${data.avatar}` : ''} alt=".." style={{ width: '48px', height: '48px' }} />
      <span>
        {data ? `${data.username}` : '..'}
        <br />
        {data ? `${checkStatusCode(data.status)} ${data.upTime}` : '..'}
      </span>
    </div>
  )
}

export default BotInfo
