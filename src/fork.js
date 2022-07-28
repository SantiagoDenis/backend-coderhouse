const loop = (iterations) => {
    let arr = []
    for(let i = 0; i < iterations; i++) {
        let random = Math.floor(Math.random() * 1000)
        arr.push(random)
    }
    return arr
}

process.on('message', (ms) => {
    const iterations = parseInt(ms)
    console.log('iterations', iterations)
    const arr = loop(iterations)
    let count = {}
    arr.forEach(element => {
        count[element] = (count[element] || 0) + 1;
    });
    console.log('count', count)
    process.send('finished')
})