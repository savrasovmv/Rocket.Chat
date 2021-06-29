import { Meteor } from 'meteor/meteor'
import { API } from '../../../api/server/api'
import { SipFavoritesCollection } from '../methods/sipFavorites'

API.v1.addRoute(
	'sip.getFavorites',
	{ authRequired: true },
	{
		get() {
			let msg = 'Избранные контакты'
			const favorites = SipFavoritesCollection.find(
				{
					userId: this.userId,
				},
				{ sort: { displayName: -1 } }
			).fetch()

			if (!msg) {
				return API.v1.failure()
			}

			return API.v1.success({
				msg,
				favorites,
			})
		},
	}
)
