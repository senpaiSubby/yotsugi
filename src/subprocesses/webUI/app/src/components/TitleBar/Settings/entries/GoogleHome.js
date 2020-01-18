import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const GoogleHome = () => {
  const [db] = useGlobal('database')
  const [ip, setIP] = useState(db.googleHome.ip)
  const [language, setLanguage] = useState(db.googleHome.language)
  const [name, setName] = useState(db.googleHome.name)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.googleHome = { ip: ip, language: language, name: name }
    await updateDB('Google Home', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Google Home</span>
      <form className="SettingsEntryForm" autoComplete="off" onSubmit={handleSubmit}>
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="IP"
          name="ip"
          value={ip}
          required={true}
          onChange={(e) => setIP(e.target.value)}
        />
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="Language"
          name="language"
          value={language}
          required={true}
          onChange={(e) => setLanguage(e.target.value)}
        />
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="Name"
          name="name"
          value={name}
          required={true}
          onChange={(e) => setName(e.target.value)}
        />
        <input className="SettingsEntryInput save" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default GoogleHome
