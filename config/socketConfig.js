let ioInstancePromise


module.exports = function (io) {

    ioInstancePromise = new Promise((resolve) => {
        const connectionHandler = (socket) => {
            console.log('A user connected')

            socket.on('disconnect', () => {
                console.log('A user disconnected')
            })

            socket.on("joinRoom", (userId)=>{
                socket.join(userId)
            })

            // Clean up the event listener after the first connection
            socket.off('connection', connectionHandler)

            // Resolve the promise with the io instance
            resolve(io)
        }

        // Attach the connection event listener
        io.on('connection', connectionHandler)
    })
}

// Create a function to get the io instance
module.exports.getIOInstance = async function () { 
    // Ensure ioInstancePromise is initialized
    if (!ioInstancePromise) {
        throw new Error('IO instance promise not initialized')
    }

    return ioInstancePromise
}
