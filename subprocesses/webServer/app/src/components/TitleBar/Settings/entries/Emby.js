import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const Emby = () => {
  const [db] = useGlobal('database')
  const [host, setHost] = useState(db.emby.host)
  const [apikey, setApikey] = useState(db.emby.apiKey)
  const [userID, setUserID] = useState(db.emby.userID)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.emby = { host: host, apiKey: apikey, userID: userID }
    await updateDB('Emby', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Emby</span>
      <form className="SettingsEntryForm" autoComplete="off" onSubmit={handleSubmit}>
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="Host"
          name="host"
          value={host}
          required={true}
          onChange={(e) => setHost(e.target.value)}
        />
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="ApiKey"
          name="apikey"
          value={apikey}
          required={true}
          onChange={(e) => setApikey(e.target.value)}
        />
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="userID"
          name="userID"
          value={userID}
          required={true}
          onChange={(e) => setUserID(e.target.value)}
        />
        <input className="SettingsEntryInput" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default Emby
