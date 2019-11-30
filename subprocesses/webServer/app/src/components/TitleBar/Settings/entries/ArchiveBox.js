import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const ArchiveBox = () => {
  const [db] = useGlobal('database')
  const [path, setPath] = useState(db.archivebox.path)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.archivebox = { path: path }
    await updateDB('Archive Box', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Archive Box</span>
      <form className="SettingsEntryForm" autoComplete="off" onSubmit={handleSubmit}>
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="path"
          name="path"
          value={path}
          required={true}
          onChange={(e) => setPath(e.target.value)}
        />

        <input className="SettingsEntryInput" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default ArchiveBox
