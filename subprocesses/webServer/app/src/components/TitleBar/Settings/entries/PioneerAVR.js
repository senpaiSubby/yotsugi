import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const PioneerAVR = () => {
  const [db] = useGlobal('database')
  const [host, setHost] = useState(db.pioneerAVR.host)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.pioneerAVR = { host: host }
    await updateDB('PioneerAVR', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Pioneer AVR</span>
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

        <input className="SettingsEntryInput" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default PioneerAVR
