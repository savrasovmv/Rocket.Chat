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
    const favorites = SipFavoritesCollection.findOne(
        {
            userId: this.userId,
            number: number
        }
    )
    if (!favorites) {
        SipFavoritesCollection.insert({
            displayName: displayName,
            number: number,
            createdAt: new Date(),
            userId: Meteor.userId(),
        })

    } else {

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
      const favorites = SipFavoritesCollection.findOne(
          {
              userId: this.userId,
              _id: _id
          }
      )
      if (favorites) {
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

      }


    },
  })


  Meteor.methods({
    'sipfavorites.remove'(_id) {
      if (!Meteor.userId()) {
        throw new Meteor.Error('Not authorized.')
      }
      const favorites = SipFavoritesCollection.findOne(
          {
              userId: this.userId,
              _id: _id
          }
      )
      if (favorites) {
          SipFavoritesCollection.remove(
              {_id: _id}
          )

      } else {

      }


    },
  })

