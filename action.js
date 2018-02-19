module.exports={
    setup(context, cb){
		console.log('setup action')
        cb()
    },
    print(res, text, next){
        res.setHeader('connection','close')
        this.setOutput(text)
		console.log('print',text)
        next()
    }
}
