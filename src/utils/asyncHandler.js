const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export default asyncHandler

//const asyncHandler = () = {}
//const asyncHandler = () => {() => {}}

// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.send(err.code || 500).json({
//             sucecss: false, 
//             message: err.message
//         })
//     }
// }