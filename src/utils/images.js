// Every category has an illustration in src/assets/products/<icon>.svg.
// import.meta.glob lets Vite bundle them all and hand back their URLs.
const modules = import.meta.glob('../assets/products/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const icons = {}
for (const [path, url] of Object.entries(modules)) {
  const name = path.split('/').pop().replace('.svg', '')
  icons[name] = url
}

export const ICON_NAMES = Object.keys(icons).filter((name) => name !== 'default')

export function iconUrl(name) {
  return icons[name] || icons.default
}

// An uploaded photo wins; otherwise fall back to the category illustration.
export function itemImage(item, category) {
  return item?.image || iconUrl(category?.icon)
}

// Resize an uploaded photo before saving so localStorage (about 5 MB) doesn't fill up.
export function fileToResizedDataUrl(file, maxSize = 480, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Choose an image file (JPG, PNG or WebP).'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('That file could not be read.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That image could not be opened.'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
