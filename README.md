# @regrapes/simple-serve

Serves a static folder while injecting configured env variables in `process.env.*`


```
Usage: simple-serve [options] <root>

Options:
  -V, --version          output the version number
  --env-file <path>      inject env from env file
  -e, --env <name>       inject env from env var (default: [])
  --env-prefix <prefix>  inject env by prefix
  --strip-env-prefix     strip env prefix (default: false)
  -p, --port <port>      server port. Defaults to process.env.PORT or 3000
  -h, --help             output usage information
```