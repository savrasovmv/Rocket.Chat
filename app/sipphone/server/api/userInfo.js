import { Meteor } from 'meteor/meteor'
import { API } from '../../../api/server/api'
import { settings } from '../../../settings';

import { SipFavoritesCollection } from '../methods/sipFavorites'

API.v1.addRoute(
	'sip.getDisplayName',
	{ authRequired: true },
	{
		get() {
			const { callNumber,  } = this.requestParams();

			let displayName

			user = Meteor.users.findOne({ipPhone: callNumber, active: true}, {$fields: {name: 1}});

			if (user) {
				displayName = user.name
			} else {
				//Поиск в избранном всех пользователей
				if (settings.get('SIPPhone_Search_Favorites')) {
					const favorites = SipFavoritesCollection.findOne(
						{
							number: callNumber,
						}
					)

					if (favorites) {
						displayName = favorites.displayName
					}
				}

			}


			let msg = 'Контакт'

			if (!displayName) {
				displayName = ''
				//return API.v1.failure()
			}

			return API.v1.success({
				msg,
				displayName: displayName,
			})
		},
	}
)
