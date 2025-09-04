import fs from 'fs'
import path from 'path'

export function getVersion(addonDir: string): string {
  const pkgPath = path.join(addonDir, 'package.json')
  if (!fs.existsSync(pkgPath)) return '0.1.0'
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  return pkg.version || '0.1.0'
}
