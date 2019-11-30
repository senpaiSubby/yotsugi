import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const RClone = () => {
  const [db] = useGlobal('database')
  const [remote, setRemote] = useState(db.rclone.remote)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.rclone = { remote: remote }
    await updateDB('RClone', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">RClone</span>
      <form className="SettingsEntryForm" autoComplete="off" onSubmit={handleSubmit}>
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="Remote"
          name="remote"
          value={remote}
          required={true}
          onChange={(e) => setRemote(e.target.value)}
        />

        <input className="SettingsEntryInput" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default RClone
