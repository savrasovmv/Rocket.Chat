import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
//import { SipHistoryCollection } from './../../client/api/SipHistory';
import { SipHistoryCollection } from '../../db/SipHistory';

//export const SipHistoryCollection = new Mongo.Collection('siphistory');

Meteor.methods({
  'siphistory.insert'(status, direction, number) {
    
    check(status, String);
    check(direction, String);
    check(number, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error('Not authorized.');
    }

    SipHistoryCollection.insert({
      status: status,
      direction: direction,
      number: number,

      createdAt: new Date(),
      userId: Meteor.userId(),
    })
  },

  
});


Meteor.publish('siphistory.lists', function() {
  if (!Meteor.userId()) {
    return Meteor.ready();
  }

  return SipHistoryCollection.find({
      userId: Meteor.userId()
    }, {
  });
});