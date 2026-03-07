const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const projectRoot = path.resolve(__dirname, '..')
const defaultSource = path.join(projectRoot, 'src', 'renderer', 'assets', 'images', 'logo.png')
const sourcePath = path.resolve(process.argv[2] || defaultSource)

const MASTER_SIZE = 1024
const ICON_SAFE_AREA = 760

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vien-icons-'))
const paddedMasterPath = path.join(tempDir, 'vien-icon-master.png')
const iconsetDir = path.join(tempDir, 'vien.iconset')

const ensureParentDir = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

const run = (command, args) => {
  execFileSync(command, args, { stdio: 'inherit' })
}

const renderPaddedMaster = () => {
  run('ffmpeg', [
    '-y',
    '-i',
    sourcePath,
    '-vf',
    `scale=${ICON_SAFE_AREA}:${ICON_SAFE_AREA}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${MASTER_SIZE}:${MASTER_SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
    '-update',
    '1',
    '-frames:v',
    '1',
    '-pix_fmt',
    'rgba',
    paddedMasterPath,
  ])
}

const resizePng = (size, outputPath) => {
  ensureParentDir(outputPath)
  run('sips', ['-z', String(size), String(size), paddedMasterPath, '--out', outputPath])
}

const buildMacIconSet = () => {
  fs.mkdirSync(iconsetDir, { recursive: true })
  const iconsetEntries = [
    ['icon_16x16.png', 16],
    ['icon_16x16@2x.png', 32],
    ['icon_32x32.png', 32],
    ['icon_32x32@2x.png', 64],
    ['icon_128x128.png', 128],
    ['icon_128x128@2x.png', 256],
    ['icon_256x256.png', 256],
    ['icon_256x256@2x.png', 512],
    ['icon_512x512.png', 512],
    ['icon_512x512@2x.png', 1024],
  ]

  for (const [filename, size] of iconsetEntries) {
    resizePng(size, path.join(iconsetDir, filename))
  }

  run('iconutil', ['-c', 'icns', iconsetDir, '-o', path.join(projectRoot, 'resources', 'icons', 'icon.icns')])
}

const main = () => {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Icon source not found: ${sourcePath}`)
  }

  renderPaddedMaster()
  resizePng(32, path.join(projectRoot, 'static', 'logo-small.png'))
  resizePng(96, path.join(projectRoot, 'static', 'logo-96px.png'))
  resizePng(512, path.join(projectRoot, 'static', 'dock-icon.png'))
  resizePng(512, path.join(projectRoot, 'resources', 'icons', 'icon.png'))
  buildMacIconSet()

  console.log(`Generated padded app icons from ${sourcePath}`)
}

main()
