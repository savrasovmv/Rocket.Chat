import { Meteor } from 'meteor/meteor'
import { API } from '../../../api/server/api'
import { SipHistoryCollection } from '../methods/sipHistory'

API.v1.addRoute(
	'sip.getHistory',
	{ authRequired: true },
	{
		get() {
			// if (!this.queryParams.msgId) {
			// 	return API.v1.failure('The "msgId" query parameter must be provided.');
			// }
			let msg = 'История звонков'
			const history = SipHistoryCollection.find(
				{
					userId: this.userId,
				},
				{ limit: 30, sort: { createdAt: -1 } }
			).fetch()
			// Meteor.runAsUser(this.userId, () => {
			// 	msg = Meteor.call('getSipHistory', {})
			// })

			if (!msg) {
				return API.v1.failure()
			}

			//const [message] = normalizeMessagesForUser([msg], this.userId);

			return API.v1.success({
				msg,
				history,
			})
		},
	}
)

// export const streamer = new Meteor.Streamer('sip')

// streamer.allowRead('all')
// streamer.allowWrite('all')

// streamer.on('message', function (sipStatus) {
// 	streamer.emit('message1', sipStatus)
// })
