export const playSound = (type: 'sent' | 'received' | 'notification' | 'match') => {
  if (typeof window === 'undefined') return

  const soundUrls = {
    sent: 'https://actions.google.com/sounds/v1/water/water_drop.ogg',
    received: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
    notification: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
    match: 'https://actions.google.com/sounds/v1/cartoon/magic_chime_chord.ogg'
  }

  try {
    const audio = new Audio(soundUrls[type])
    audio.volume = 0.5 // volume agréable
    audio.play().catch(e => {
      // Ignorer les erreurs d'autoplay
      console.debug('Audio autoplay prevented:', e)
    })
  } catch (err) {
    console.debug('Failed to play sound:', err)
  }
}
