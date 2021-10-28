import fs from 'fs'

import chalk from 'chalk'
import { parse } from 'dotenv'

interface Options {
  file?: string
  prefix?: string
  stripPrefix?: boolean
  env?: Array<string>
}
export const resolveInjection = ({ file, prefix, stripPrefix, env }: Options) => {
  const injection: Record<string, string> = {}
  if (file) {
    try {
      Object.assign(injection, parse(fs.readFileSync(file)))
    } catch (error: any) {
      throw new Error(chalk`Could not read file {bold ${file}}: {bold ${error.message}}`)
    }
  }

  if (env) {
    env.forEach(name => {
      if (!(name in process.env)) {
        console.warn(chalk`{yellow variable {bold ${name}} does not exist in your environment}`)
        return
      }
      injection[name] = process.env[name]!
    })
  }

  if (prefix) {
    Object.entries(process.env).forEach(([name, value]) => {
      if (value && name.startsWith(prefix)) {
        injection[stripPrefix ? name.substring(prefix.length) : name] = value
      }
    })
  }

  return injection
}
