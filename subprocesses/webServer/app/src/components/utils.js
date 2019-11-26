const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

const sendCommand = async (command) => {
  console.log(command)
  const postData = {
    apiKey: 284695,
    command: command
  }
  try {
    const response = await fetch('http://10.0.0.7:5700/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })
    const data = await response.json()
    return data
    //M.toast({ html: capitalize(data.response), classes: 'toastNotification' })
  } catch {
    //M.toast({ html: 'There was an error connecting.', classes: 'toastNotification' })
  }
}

const lightSlider = async (value) => {
  await sendCommand(`lamp desk ${value}`)
  console.log(value)
}

export { capitalize, sendCommand, lightSlider }
