import { useGlobal, useState } from 'reactn'
import { updateDB } from '../../../Utils/Utils'

const Sengled = () => {
  const [db] = useGlobal('database')
  const [username, setUsername] = useState(db.sengled.username)
  const [password, setPassword] = useState(db.sengled.password)
  const [jsessionID, setJsessionID] = useState(db.sengled.jsessionid)

  const handleSubmit = async (e) => {
    e.preventDefault()
    db.sengled = { username: username, password: password, jsessionid: jsessionID }
    await updateDB('Emby', db)
  }

  return (
    < div
  className = 'SettingsEntry' >
    < span
  className = 'SettingsEntryTitle' > Sengled
  Lights < /span>
  < form
  className = 'SettingsEntryForm'
  autoComplete = 'off'
  onSubmit = { handleSubmit } >
    < input
  className = 'SettingsEntryInput'
  type = 'text'
  placeholder = 'Username'
  name = 'username'
  value = { username }
  required = { true }
  onChange = {(e)
=>
  setUsername(e.target.value)
}
  />
  < input
  className = 'SettingsEntryInput'
  type = 'text'
  placeholder = 'Password'
  name = 'pass'
  value = { password }
  required = { true }
  onChange = {(e)
=>
  setPassword(e.target.value)
}
  />
  < input
  className = 'SettingsEntryInput'
  type = 'text'
  placeholder = 'JSessionID'
  name = 'sessionID'
  value = { jsessionID }
  required = { true }
  onChange = {(e)
=>
  setJsessionID(e.target.value)
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

export default Sengled
