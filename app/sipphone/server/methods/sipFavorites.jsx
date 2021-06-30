import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter'
import {sipHistoryUpdateName} from './sipHistory'

export const SipFavoritesCollection = new Mongo.Collection('sip_favorites')

Meteor.methods({
  'sipfavorites.insert'(displayName, number) {
    check(number, String)
    check(displayName, String)

    if (!Meteor.userId()) {
      throw new Meteor.Error('Not authorized.')
    }
    console.log("++++++++++++sipfavorites.insert++++++++++++++")
    console.log("displayName" ,displayName)
    console.log("number" ,number)
    const favorites = SipFavoritesCollection.findOne(
        {
            userId: this.userId,
            number: number
        }
    )
    if (!favorites) {
        console.log("Номер добавлен в избранное")
        SipFavoritesCollection.insert({
            displayName: displayName,
            number: number,
            createdAt: new Date(),
            userId: Meteor.userId(),
        })

    } else {
        console.log("Номер уже добавлен в избранное")

    }


  },
})

Meteor.methods({
    'sipfavorites.update'(_id, displayName, number) {
      check(number, String)
      check(displayName, String)

      if (!Meteor.userId()) {
        throw new Meteor.Error('Not authorized.')
      }
      console.log("++++++++++++sipfavorites.update++++++++++++++")
      console.log("_id" ,_id)
      console.log("displayName" ,displayName)
      console.log("number" ,number)
      const favorites = SipFavoritesCollection.findOne(
          {
              userId: this.userId,
              _id: _id
          }
      )
      if (favorites) {
          console.log("Номер существует, обновляем")
          SipFavoritesCollection.update(
              {_id: _id},
              {
                displayName: displayName,
                number: number,
                createdAt: new Date(),
                userId: Meteor.userId(),
              }
          )

          sipHistoryUpdateName(number, displayName)

      } else {
          console.log("Номера нет в избранном")

      }


    },
  })


  Meteor.methods({
    'sipfavorites.remove'(_id) {
      if (!Meteor.userId()) {
        throw new Meteor.Error('Not authorized.')
      }
      console.log("++++++++++++sipfavorites.remove++++++++++++++")
      console.log("_id" ,_id)
      const favorites = SipFavoritesCollection.findOne(
          {
              userId: this.userId,
              _id: _id
          }
      )
      if (favorites) {
          console.log("Номер существует, удаляем")
          SipFavoritesCollection.remove(
              {_id: _id}
          )

      } else {
          console.log("Номера нет в избранном")

      }


    },
  })

