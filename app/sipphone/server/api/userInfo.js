import { Meteor } from 'meteor/meteor'
import { API } from '../../../api/server/api'
import { SipFavoritesCollection } from '../methods/sipFavorites'

API.v1.addRoute(
	'sip.getDisplayName',
	{ authRequired: true },
	{
		get() {
			console.log("+++++++++++ sip.getDisplayName +++++++++++++++")
			const { ipPhone } = this.requestParams();
			contact = Meteor.users.findOne({ipPhone: ipPhone}, {});


			console.log("+++++++++++contact", contact)
			let msg = 'Контакт'

			if (!msg) {
				return API.v1.failure()
			}

			return API.v1.success({
				msg,
				displayName: contact.name,
			})
		},
	}
)
