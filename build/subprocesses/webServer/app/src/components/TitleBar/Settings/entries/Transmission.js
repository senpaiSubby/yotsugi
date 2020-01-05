import React, { useState, useGlobal } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const Transmission = () => {
  const [db] = useGlobal('database')
  const [host, setHost] = useState(db.transmission.host)
  const [port, setPort] = useState(db.transmission.port)
  const [ssl, setSSL] = useState(db.transmission.ssl)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.transmission = { host: host, port: port, ssl: ssl }
    await updateDB('Transmission', db)
  }

  return (
    <div className="SettingsEntry">
      <span className="SettingsEntryTitle">Transmission</span>
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
          placeholder="Port"
          name="port"
          value={port}
          required={true}
          onChange={(e) => setPort(e.target.value)}
        />
        <input
          className="SettingsEntryInput"
          type="text"
          placeholder="SSL ?"
          name="ssl"
          value={ssl}
          required={true}
          onChange={(e) => setSSL(e.target.value)}
        />
        <input className="SettingsEntryInput save" type="submit" value="SAVE" />
      </form>
    </div>
  )
}

export default Transmission
