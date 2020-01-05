import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const PiHole = () => {
  const [db] = useGlobal('database')
  const [host, setHost] = useState(db.pihole.host)
  const [apikey, setApikey] = useState(db.pihole.apiKey)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.pihole = { host: host, apiKey: apikey }
    await updateDB('PiHole', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">PiHole</span>
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

        <input className="SettingsEntryInput save" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default PiHole
