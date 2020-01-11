import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const Google = () => {
  const [db] = useGlobal('database')
  const [apikey, setApikey] = useState(db.google.apiKey)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.google = { apiKey: apikey }
    await updateDB('Google', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Google</span>
      <form className="SettingsEntryForm" autoComplete="off" onSubmit={handleSubmit}>
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

export default Google
