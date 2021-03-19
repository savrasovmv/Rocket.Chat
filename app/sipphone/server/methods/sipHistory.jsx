import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
//import { SipHistoryCollection } from './../../client/api/SipHistory';
//import { SipHistoryCollection } from '../../db/SipHistory'
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter'

//export const SipHistoryCollection = new Mongo.Collection('siphistory');
export const SipHistoryCollection = new Mongo.Collection('sip_history')

Meteor.methods({
  'siphistory.insert'(status, direction, number) {
    check(status, String)
    check(direction, String)
    check(number, String)

    if (!Meteor.userId()) {
      throw new Meteor.Error('Not authorized.')
    }

    SipHistoryCollection.insert({
      status: status,
      direction: direction,
      number: number,

      createdAt: new Date(),
      userId: Meteor.userId(),
    })
  },
})

Meteor.publish('siphistory.lists', function () {
  if (!Meteor.userId()) {
    return Meteor.ready()
  }

  return SipHistoryCollection.find(
    {
      userId: Meteor.userId(),
    },
    { limit: 5, sort: { createdAt: -1 } }
  )
})
Meteor.publish('siphistory.lists5', function () {
  if (!Meteor.userId()) {
    return Meteor.ready()
  }

  return SipHistoryCollection.find(
    {
      userId: Meteor.userId(),
    },
    { limit: 5 }
  )
})
//, sort: { createdAt: -1 }
Meteor.methods({
  getSipHistory() {
    const userId = Meteor.userId()
    if (!userId) {
      throw new Meteor.Error('error-invalid-user', 'Invalid user', {
        method: 'getSipHistory',
      })
    }

    const history = SipHistoryCollection.find(
      {
        userId: Meteor.userId(),
      },
      {}
    )
    if (history == null) {
      throw new Meteor.Error('error-not-allowed', 'Not allowed', {
        method: 'getSipHistory',
      })
    }

    return history
  },
})

DDPRateLimiter.addRule(
  {
    type: 'method',
    name: 'getSipHistory',
    userId() {
      return true
    },
  },
  10,
  60000
)
