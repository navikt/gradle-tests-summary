import { Writable } from 'stream'

export function captureWritable(): { stream: Writable; getOutput: () => string } {
  let output = ''

  const stream = new Writable({
    write(chunk, _, callback) {
      output += chunk.toString()
      callback()
    },
  })

  return { stream, getOutput: () => output }
}
