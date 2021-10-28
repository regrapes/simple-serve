import express, { Request, Response, NextFunction } from 'express'

interface Options {
  root: string
  injection: Record<string, string>
}

export const createServe =
  ({ root, injection = {} }: Options) =>
  (req: Request, res: Response, next: NextFunction) => {
    let initiale = true
    let shouldInject = false
    let injected = false

    const injectBuffer = Buffer.from(
      `<script>Object.assign(window, { process: { env: ${
        typeof injection === 'string' ? injection : JSON.stringify(injection)
      }}})</script>`
    )

    const staticHandler = express.static(root)

    const preprocess = (res: Response) => {
      if (!initiale) {
        return
      }

      initiale = false
      const contentType = res.getHeader('content-type')
      shouldInject = typeof contentType === 'string' && contentType.startsWith('text/html')

      if (shouldInject) {
        const length = res.getHeader('content-length') as number
        res.setHeader('content-length', length + Buffer.byteLength(injectBuffer))
      }
    }

    const inject = (chunk: Buffer) => {
      if (!shouldInject || injected) {
        return chunk
      }

      let index = chunk.indexOf('<script')

      if (!~index) {
        index = chunk.indexOf('</html')
      }

      if (!~index) {
        return chunk
      }

      injected = true

      return Buffer.concat([chunk.slice(0, index), injectBuffer, chunk.slice(index)])
    }

    const originalWrite = res.write.bind(res)

    const wrappedWrite = (chunk: Buffer, ...args: Array<any>) => {
      preprocess(res)
      return originalWrite(inject(chunk), ...args)
    }

    res.write = wrappedWrite

    staticHandler(req, res, next)
  }
