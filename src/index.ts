import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import compression from 'compression'
import express from 'express'
import yargs from 'yargs'

import { version } from '../package.json'

import { createServe } from './createServe'
import { resolveInjection } from './resolveInjection'

process.on('uncaughtException', error => {
  console.error(chalk.red(`\n${error.message}\n`))
  process.exit(1)
})

process.on('SIGINT', () => {
  console.error(chalk.yellow.bold(`\nHave a nice day\n`))
  process.exit(0)
})

const options = yargs
  .version(version)
  .command('* [root]', 'serves', yargs =>
    yargs
      .option('env-file', {
        string: true,
        description: 'inject env from env file',
      })
      .option('env', {
        alias: 'e',
        string: true,
        array: true,
        nargs: 1,
        description: 'inject env from env var',
      })
      .option('env-prefix', {
        string: true,
        description: 'inject env by prefix',
      })
      .option('strip-env-prefix', {
        boolean: true,
        default: false,
        description: 'strip env prefix',
      })
      .option('compress', {
        boolean: true,
        default: true,
        description: 'gzip resoponses',
      })
      .option('port', {
        alias: 'p',
        number: true,
        default: 'PORT' in process.env ? Number(process.env.PORT) : 3000,
        description: 'listening port',
      })
      .positional('root', {
        type: 'string',
        default: '.',
        description: 'directory to serve',
        coerce: root => {
          const resolved = path.resolve(root)
          if (!fs.existsSync(resolved)) {
            throw new Error(`${root} does not exists`)
          }
          if (!fs.lstatSync(resolved).isDirectory()) {
            throw new Error(`${root} is not a directory`)
          }

          return resolved
        },
      })
  )
  .fail(false)
  .parseSync()

const injection = resolveInjection({
  file: options['env-file'],
  env: options.env,
  prefix: options['env-prefix'],
  stripPrefix: options['strip-env-prefix'],
})

const app = express()

if (options.compress) {
  app.use(compression())
}

app.use(
  createServe({
    root: options.root,
    injection,
  })
)

app.use('*', (_, res) => {
  res.sendFile('index.html', { root: options.root })
})

app.listen(options.port, () => {
  console.log()
  console.log(chalk.blue.bold('  Root:\t') + chalk.white(`./${path.relative(process.cwd(), options.root)}`))
  console.log(chalk.blue.bold('  Port:\t') + chalk.white(options.port))
  process.stdout.write(chalk.blue.bold('  Env:\t'))
  const entries = Object.entries(injection)
  if (entries.length === 0) {
    console.log(chalk.white('none'))
  }
  entries.forEach(([name, value], index) => {
    console.log((index === 0 ? '' : '\t') + chalk.white.bold(`${name}: `) + chalk.grey.bold(value))
  })
  console.log(chalk.bold.green('\n  Listening...\n'))
})
