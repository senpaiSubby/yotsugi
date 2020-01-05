import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const Ombi = () => {
  const [db] = useGlobal('database')
  const [host, setHost] = useState(db.ombi.host)
  const [apikey, setApikey] = useState(db.ombi.apiKey)
  const [username, setUsername] = useState(db.ombi.username)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.ombi = { host: host, apiKey: apikey, username: username }
    await updateDB('Emby', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Ombi</span>
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
          placeholder="Username"
          name="username"
          value={username}
          required={true}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input className="SettingsEntryInput save" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default Ombi
