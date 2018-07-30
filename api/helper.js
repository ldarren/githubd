module.exports = {
	setup(context, cb){
		console.log('setup helper')
		cb()
	},
	print(res, text, next){
		res.setHeader('connection','close')
		this.setOutput(text)
		console.log('print',text)
		next()
	},
	method(req, branch){
		this.fork(req.method + branch)
	}
}
