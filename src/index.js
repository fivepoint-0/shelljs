const minimist = require('minimist');
const exec = require('child_process').exec

let args = minimist(process.argv.slice(2), {
    alias: {
        h: 'help',
        v: 'version'
    }
})

async function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 10000000 }, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
        reject(error)
      }
      resolve(stdout ? stdout : stderr)
    })
  })
}

async function dir() {
  const stdin = 'dir /b /s C:\\Windows\\'
  return execShellCommand(stdin)
}

console.time("async_test")

const promises = new Array(5)
for (let i = 0; i < 5; i++) {
  promises[i] = dir()
    .then(response => console.log(`ASYNC-${i} RETURNED`))
    .catch(response => console.log(`ASYNC-${i} ERRORED`))
}

Promise.all(promises)
  .then(responses => {
    console.log("\n")
    console.timeEnd("async_test")

    console.log("\n\n")
    console.time("sync_test")
    const dir1 = dir().then(_ => dir().then(response => console.log(`SYNC-${1} RETURNED`)).catch(response => `SYNC-${1} ERRORED`))
    const dir2 = dir1.then(_ => dir().then(response => console.log(`SYNC-${2} RETURNED`)).catch(response => `SYNC-${2} ERRORED`))
    const dir3 = dir2.then(_ => dir().then(response => console.log(`SYNC-${3} RETURNED`)).catch(response => `SYNC-${3} ERRORED`))
    const dir4 = dir3.then(_ => dir().then(response => console.log(`SYNC-${4} RETURNED`)).catch(response => `SYNC-${4} ERRORED`))
    dir4.then(_ => dir()).then(response => console.log(`SYNC-${4} RETURNED`)).catch(response => `SYNC-${4} ERRORED`)
      .then(_ => { console.log("\n"); console.timeEnd("sync_test") })
  })
  .catch(responses => console.error(responses))