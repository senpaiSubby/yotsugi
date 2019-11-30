import React, { useGlobal, useEffect } from 'reactn'
import Popup from 'reactjs-popup'
import AddCommand from './entries/AddCommand'
import ApiKey from './entries/ApiKey'
import Emby from './entries/Emby'
import ArchiveBox from './entries/ArchiveBox'
import Docker from './entries/Docker'
import Google from './entries/Google'
import GoogleHome from './entries/GoogleHome'
import Jackett from './entries/Jackett'
import Meraki from './entries/Meraki'
import Ombi from './entries/Ombi'
import PiHole from './entries/PiHole'
import PioneerAVR from './entries/PioneerAVR'
import RClone from './entries/RClone'
import SabNZBD from './entries/SabNZBD'
import Sengled from './entries/Sengled'
import Transmission from './entries/Transmission'

import './Settings.css'

const Settings = () => {
  // eslint-disable-next-line
  const [db, setDB] = useGlobal('database')

  useEffect(() => {
    fetch('/api/db/app')
      .then((response) => response.json())
      .then((data) => setDB(data))
  }, [setDB])

  return (
    <Popup trigger={<button className="TitleBarButton">Settings</button>} modal>
      {(close) => (
        <div className="Settings">
          <div className="SettingsHeader">
            <span style={{ fontSize: '1rem' }}>Settings</span>
            <span style={{ cursor: 'pointer' }} onClick={close}>
              &times;
            </span>
          </div>
          <div className="SettingsContainer">
            <ApiKey />
            <AddCommand />
            <ArchiveBox />
            <Docker />
            <Emby />
            <Google />
            <GoogleHome />
            <Jackett />
            <Meraki />
            <Ombi />
            <PiHole />
            <PioneerAVR />
            <RClone />
            <SabNZBD />
            <Sengled />
            <Transmission />
          </div>
        </div>
      )}
    </Popup>
  )
}

export default Settings
