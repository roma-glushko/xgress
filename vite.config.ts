import { join } from 'path'
import type { UserConfig } from 'vite'
import preactRefresh from '@prefresh/vite'

const config: UserConfig = {
  jsx: 'preact',
  alias: {
    '/@/': join(__dirname, 'src'),
  },
  plugins: [preactRefresh()]
}

export default config
