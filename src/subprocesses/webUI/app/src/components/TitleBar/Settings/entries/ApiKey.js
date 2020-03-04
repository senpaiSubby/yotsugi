import { useState } from 'reactn'
import { notify } from '../../../Utils/Utils'

const ApiKey = () => {
  const [apiKey, setApiKey] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    localStorage.setItem('apiKey', apiKey)
    notify(`ApiKey set to [ ${apiKey} ]`)
    setApiKey('')
  }

  return (
    < div
  className = 'SettingsEntry' >
    < span
  className = 'SettingsEntryTitle' > WebUI
  ApiKey < /span>
  < form
  className = 'SettingsEntryForm'
  autoComplete = 'off'
  onSubmit = { handleSubmit } >
    < input
  className = 'SettingsEntryInput'
  type = 'text'
  placeholder = 'API KEY'
  name = 'apiKey'
  value = { apiKey }
  required = { true }
  onChange = {(e)
=>
  setApiKey(e.target.value)
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

export default ApiKey
