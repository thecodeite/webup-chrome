
let paused = true

function updateIcon(strength) {
  if (paused) return
  const imageData = generateIcon(strength, 5)
  chrome.browserAction.setIcon({imageData});
}

chrome.browserAction.onClicked.addListener(clicked);

function clicked () {
  if (paused) {
    tick()
    setInterval(tick, 5000)
    paused = false
    setTimeout(() => {
      chrome.browserAction.setIcon({path: 'pause.png'});
      paused = true
    }, 1000 * 60)
  } else {
    chrome.browserAction.setIcon({path: 'pause.png'});
    paused = true
  }
}

function tick() {
  const start = new Date()
  let handled = false
  const timeoutHandle = setTimeout(() => {
    if (!handled) {
      handled = true
      return updateIcon(1)
    }
  }, 5000)
  fetch('https://status.cloud.google.com/feed.atom', {method: 'GET'})
    .then(res => {
      const end = new Date()
      const took = end-start
      console.log('took:', took)

      if (handled) {
        console.log('Oh, we were too slow')
      } else {
        clearTimeout(timeoutHandle)
        handled = true
        let strength
        if (took < 500) strength = 5
        else if (took < 1000) strength = 4
        else if (took < 2000) strength = 3
        else if (took < 5000) strength = 2
        else strength = 1
        updateIcon(strength)
      }
    })
}


// chrome.browserAction.onClicked.addListener(updateIcon);
// updateIcon();

function generateIcon(strength, maxStrength) {
  const canvas = document.createElement('canvas')
  const width = canvas.width = 16
  const height = canvas.height = 16

  const strengthColours = []
  const toHex = x => x < 16 ? '0' + x.toString(16) : x.toString(16)
  for (let s = 0; s < maxStrength; s++) {
    let g = Math.floor(0xdd * (s / (maxStrength-1)))
    let r = Math.floor(0xff * (1 - (s / (maxStrength-1))))
    let b =0xff - Math.abs(Math.floor(0x1fe * (s / (maxStrength -1))) - 0xff)
    strengthColours.push('#' + toHex(r) + toHex(g) + toHex(b))
  }

  const context = canvas.getContext('2d')


  context.clearRect(0, 0, width, height)
  context.fillStyle = 'black'

  let barHSpace = (1 / maxStrength) * width * 0.5
  let barWidth = (1 / maxStrength) * width * 0.8 * 0.5

  for(let bar = 0; bar < maxStrength; bar ++) {
    let center = ((1 / maxStrength) * bar * width) + barHSpace
    let barHeight = ((bar + 1) / (maxStrength + 2)) * height

    context.fillStyle = strength > bar ? strengthColours[strength-1] : 'white'
    context.fillRect(center-barWidth,  (height * 0.9) - barHeight, barWidth * 2, barHeight )
  }
  const data = context.getImageData(0, 0, width, height)
  return data

}
