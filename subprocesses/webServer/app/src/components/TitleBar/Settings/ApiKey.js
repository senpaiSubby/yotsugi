import React, { useState } from 'reactn'
import { notify } from '../../Utils'

const ApiKey = () => {
  const [apiKey, setApiKey] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    localStorage.setItem('apiKey', apiKey)
    notify(`ApiKey set to [ ${apiKey} ]`)
    setApiKey('')
  }

  return (
    <form
      autoComplete="off"
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: '5px',
        gridTemplateColumns: '125px 50px'
      }}
    >
      <input
        type="text"
        style={{
          width: '125px',
          border: 'none',
          fontSize: '0.7rem',
          backgroundColor: '#3E4245',
          color: '#dfdfdf',
          textAlign: 'center',
          height: '35px'
        }}
        placeholder="API KEY"
        name="apiKey"
        value={apiKey}
        required={true}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <input
        type="submit"
        style={{
          border: 'none',
          fontSize: '0.7rem',
          backgroundColor: '#3E4245',
          color: '#757163',
          height: '35px'
        }}
        value="Save"
      />
    </form>
  )
}

export default ApiKey
