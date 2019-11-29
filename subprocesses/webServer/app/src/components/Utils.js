import { toast, Flip } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const notify = (message) =>
  toast(message, {
    position: 'bottom-center',
    autoClose: 4000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: 'toast',
    transition: Flip
  })

const sendCommand = async (command) => {
  const apiKey = localStorage.getItem('apiKey') || ''
  try {
    const response = await fetch('/api/commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, command })
    })
    const data = await response.json()
    return notify(data.response)
  } catch {
    return notify('There was an error connecting.')
  }
}

export { notify, sendCommand }
