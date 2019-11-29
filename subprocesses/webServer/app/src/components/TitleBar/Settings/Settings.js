import React from 'reactn'
import Popup from 'reactjs-popup'
import AddCommand from './AddCommand'
import ApiKey from './ApiKey'

const Settings = () => {
  return (
    <Popup trigger={<button className="settingsButton">S</button>} modal>
      {(close) => (
        <div className="settings">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '#8ec07c 1px solid',
              paddingBottom: '5px'
            }}
          >
            <a style={{ fontSize: '1rem' }}>Settings</a>
            <a style={{ cursor: 'pointer' }} onClick={close}>
              &times;
            </a>
          </div>
          <div className="settingsItems">
            <ApiKey />
            <AddCommand />
          </div>
        </div>
      )}
    </Popup>
  )
}

export default Settings
