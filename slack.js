// https://tutorials.botsfloor.com/creating-a-slack-command-bot-from-scratch-with-node-js-distribute-it-25cf81f51040
const path = require('path')
const pUtil = require('picos-util')

const KEY = process.env.SLACK_KEY
const CLIENT_ID= process.env.SLACK_CLIENT_ID
const CLIENT_SECRET= process.env.SLACK_CLIENT_SECRET
const COMMANDS = {
	'/gopal': {
		'deploy': [3, 3]
	}
}

function push(url, token, text, cb){
	pUtil.ajax('POST', url, { text, token }, { headers: {'Content-Type': 'application/json'} }, (err, state, ret) => {
		if (4 !== state) return
		cb(err, ret)
	})
}

module.exports = {
    setup(context, cb){
		console.log('setup slack actions')
        cb()
    },
	verify(body, syntax, next){
		if (KEY !== body.token) return next(this.error(401))
		const COMMAND = COMMANDS[body.command]
		if (!COMMAND) return next(this.error(404))
		// TODO verify TEAM. CHANNEL and USER?

		const params = body.text.split(' ')
		const limit = COMMAND[params[0]]
		if (limit[0] < params.length || limit[1] > params.length) return next(this.error(400))
		syntax.push(...params)
		next()
	},
	oauth(query, next){
		const data = { 
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			code: query.code 
		}
		/* sample response
		{"ok":true,"access_token":"xxx-xxx-xxx","scope":"identify,commands,incoming-webhook","user_id":"UIDUID","team_name":"FULL NAME","team_id":"TIDTID","incoming_webhook":{"channel":"#CHANNEL","channel_id":"CIDCID","configuration_url":"CURL","url":"URL"}}
		*/
		pUtil.ajax('POST', 'https://slack.com/api/oauth.access', data, null, (err, state, json) => { 
			if (4 !== state) return
			if (err) return next(this.error(500, err))
			// You are done. 
			// If you want to get team info, you need to get the token here 
			try { var obj = JSON.parse(json) }
			catch (exp) { return next(this.error(500, exp)) }

			console.log(json)

			push(obj.incoming_webhook.url, obj.access_token, 'Thanks for adding Gopal, I\'m at your disposal', (err, ret) => {
				if (err) return console.error(err)
			})
			this.setOutput('DONE!')
			next()
		})
	},
	webhooks(body, syntax, next){
		console.log('syntax', syntax)
		console.log('body', body)

		// REF: https://api.slack.com/docs/message-formatting
		this.setOutput({ 
			response_type: 'in_channel', // public to the channel or ephemeral
			text: '302: Found', 
			attachments:[ { 
				image_url: 'https://http.cat/302.jpg' 
			} ]
		}); 
		next()
	}
}
