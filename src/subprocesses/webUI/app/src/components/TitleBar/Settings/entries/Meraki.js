import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const Meraki = () => {
  const [db] = useGlobal('database')
  const [serielNum, setSerielNum] = useState(db.meraki.serielNum)
  const [apikey, setApikey] = useState(db.meraki.apiKey)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.meraki = { serielNum: serielNum, apiKey: apikey }
    await updateDB('Meraki', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Meraki</span>
      <form className="SettingsEntryForm" autoComplete="off" onSubmit={handleSubmit}>
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="ApiKey"
          name="apiKey"
          value={apikey}
          required={true}
          onChange={(e) => setApikey(e.target.value)}
        />
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="Seriel Number"
          name="serielNum"
          value={serielNum}
          required={true}
          onChange={(e) => setSerielNum(e.target.value)}
        />

        <input className="SettingsEntryInput save" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default Meraki
