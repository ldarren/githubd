const path = require('path')
const pJWT = require('pico-jwt')
const pUtil = require('picos-util')

const KEY = process.env.GH_KEY
const APP_ID = process.env.GH_APP
const INSTALL_ID = process.env.GH_INSTALL
const USER_AGENT = process.env.GH_AGENT
const CLIENT_ID= process.env.GH_CLIENT_ID
const CLIENT_SECRET= process.env.GH_CLIENT_SECRET
const ACCEPT = {
	html: 'application/vnd.github.VERSION.html',
	json: 'application/json',
	obj: 'application/vnd.github.VERSION.object',
	preview: 'application/vnd.github.machine-man-preview+json',
	raw: 'application/vnd.github.VERSION.raw'
}
const TYPES = {
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.json': 'application/json'
}

let INSTALL_TOKEN = ''
let INSTALL_EXP = 0
let jwt

function getToken(ttl = 10){
	const now = Math.floor(Date.now() / 1000)
	return jwt.create({
		iat: now,
		exp: now + (ttl * 60),
		iss: APP_ID
	})
}

function getInstallationToken(cb){
	if (Date.now() < INSTALL_EXP) return cb(null, INSTALL_TOKEN)

	pUtil.ajax('POST', 'https://api.github.com/installations/' + INSTALL_ID + '/access_tokens', null, {
		headers: {
			'Authorization': 'Bearer ' + getToken(),
			'Accept': ACCEPT['preview'],
			'User-agent': USER_AGENT
		}
	}, (err, state, json) => {
		if (4 !== state) return
		if (err) return cb(err)
		try { var obj = JSON.parse(json) }
		catch(exp) { return cb(exp) }
		INSTALL_TOKEN = obj.token
		INSTALL_EXP = (new Date(obj.expires_at)).getTime() - 60000
		cb(null, INSTALL_TOKEN)
	})
}

module.exports={
    setup(context, cb){
		console.log('setup github')
		jwt = new pJWT('RS256', KEY)
        cb()
    },
	// as githup app
    getApp(res, next){
		pUtil.ajax('GET', 'https://api.github.com/app', null, {
			headers: {
				'Authorization': 'Bearer ' + getToken(),
				'Accept': ACCEPT['preview'],
				'User-agent': USER_AGENT
			}
		}, (err, state, json) => {
			if (4 !== state) return
			if (err) return console.error(err), this.error(err.code, err.error)
			res.setHeader('connection','close')
			this.setOutput(json)
			next()
		})
    },
	// user access
    getAuth(query, res, next){
		pUtil.ajax('POST', `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${query.code}&state=${query.state}`, {
		},{
			headers: {
				'Accept': ACCEPT['json'],
			}
		}, (err, state, json) => {
			if (4 != state) return
			if (err) return console.error(err), this.error(err.code, err.error)
			res.setHeader('connection','close')
			this.setOutput(json)
			next()
		})
    },
    repos(query, res, next){
		getInstallationToken((err, token) => {
			if (err) return console.error(err), this.error(err.code, err.error)
			const p = this.params
			pUtil.ajax(p.method, 'https://api.github.com/repos/' + p.path, null, {
				headers: {
					'Authorization': 'token ' + token,
					'Accept': ACCEPT[p.accept],
					'User-agent': USER_AGENT
				}
			}, (err, state, json) => {
				if (4 !== state) return
				if (err) return console.error(err), this.error(err.code, err.error)
				if ('html' === query.type)
					res.writeHead(200, {
						'Content-Type': 'text/html'
					})
				this.setOutput(json)
				next()
			})
		})
    },
	raw(res, next){
		getInstallationToken((err, token) => {
			if (err) return console.error(err), this.error(err.code, err.error)
			const p = this.params
			pUtil.ajax('GET', 'https://raw.githubusercontent.com/' + p.path, null, {
				headers: {
					'Authorization': 'token ' + token,
					'Accept': 'application/vnd.github.VERSION.raw',
					'User-agent': USER_AGENT
				}
			}, (err, state, json) => {
				if (4 !== state) return
				if (err) return console.error(err), this.error(err.code, err.error)
				res.writeHead(200, {
					'Content-Type': TYPES[path.extname(p.path)] || 'text/plain',
					'Access-Control-Allow-Origin': '*',
					'connection': 'close'
				})
				this.setOutput(json)
				next()
			})
		})
	},
	webhooks(req, body, next){
		switch(req.headers['x-github-event']){
		case 'ping': this.setOutput('it works!'); break;
		case 'release':
			const rel = body.release
			if (rel.draft || rel.prerelease) break
			console.log('deploying', rel.name, '...')
			break
		case 'push':
		default:
			console.log('header', req.headers)
			console.log('body', body)
			this.setOutput(body)
			break
		}
		next()
	}
}
