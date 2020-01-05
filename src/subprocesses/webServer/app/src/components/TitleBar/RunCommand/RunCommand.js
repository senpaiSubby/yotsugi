import React, { useState } from 'reactn'
import { sendCommand } from '../../Utils/Utils'
import Popup from 'reactjs-popup'

const RunCommand = () => {
  const [command, setCommand] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    await sendCommand(command)
    setCommand('')
  }

  return (
    <Popup trigger={<button className="TitleBarButton">Run</button>} modal>
      {(close) => (
        <div className="Settings">
          <div className="SettingsHeader">
            <span style={{ fontSize: '1rem' }}>Run Command</span>
            <span style={{ cursor: 'pointer' }} onClick={close}>
              &times;
            </span>
          </div>
          <div className="SettingsContainer">
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
          </div>
        </div>
      )}
    </Popup>
  )
}
export default RunCommand
