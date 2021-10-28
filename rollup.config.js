import path from 'path'

import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    file: 'bin/cli.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
  external: id => id.endsWith('.json') || !(id.startsWith('.') || path.isAbsolute(id)),
  plugins: [json(), typescript()],
}
