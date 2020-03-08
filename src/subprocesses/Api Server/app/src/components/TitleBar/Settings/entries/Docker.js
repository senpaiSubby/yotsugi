import { useGlobal, useState } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const Docker = () => {
  const [db] = useGlobal('database')
  const [host, setHost] = useState(db.docker.host)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.docker = { host: host }
    await updateDB('Docker', db)
  }

  return (
    < div
  className = 'SettingsEntry' >
    < span
  className = 'SettingsEntryTitle' > Docker < /span>
    < form
  className = 'SettingsEntryForm'
  autoComplete = 'off'
  onSubmit = { handleSubmit } >
    < input
  className = 'SettingsEntryInput'
  type = 'text'
  placeholder = 'Host'
  name = 'host'
  value = { host }
  required = { true }
  onChange = {(e)
=>
  setHost(e.target.value)
}
  />
  < input
  className = 'SettingsEntryInput save'
  type = 'submit'
  value = 'SAVE' / >
    < /form>
    < /div>
)
}

export default Docker
