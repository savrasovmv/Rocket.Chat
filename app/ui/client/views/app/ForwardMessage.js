import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { roomTypes } from '../../../../utils/client';
import { call } from '../../../../ui-utils/client';

import { ChatRoom } from '../../../../models/client';
import './ForwardMessage.html';

Template.ForwardMessage.helpers({
	createIsDisabled() {
		return Template.instance().selectedRoom.get().length === 0 ? 'disabled' : '';
	},
	forwardChannel() {
		const instance = Template.instance();
		return instance.forwardChannel.get();
	},


	forwardIsDisabled() {
		return Template.instance().selectedRoom.get().length === 0 ? 'disabled' : '';
	},

	deleteLastItemRoom() {
		return Template.instance().deleteLastItemRoom;
	},


	onClickTagRoom() {
		return Template.instance().onClickTagRoom;
	},
	selectedRoom() {
		return Template.instance().selectedRoom.get();
	},
	onSelectRoom() {
		return Template.instance().onSelectRoom;
	},
	roomCollection() {
		return ChatRoom;
	},
	roomSelector() {
		return (expression) => ({text: expression});
	},
	roomModifier() {
		return (filter, text = '') => {
			const f = filter.get();
			return `#${ f.length === 0 ? text : text.replace(new RegExp(filter.get(), 'i'), (part) => `<strong>${ part }</strong>`) }`;
		};
	},
	
});

const waitUntilRoomBeInserted = async (rid) => new Promise((resolve) => {
	Tracker.autorun((c) => {
		const room = roomTypes.findRoom('d', rid, Meteor.user());
		if (room) {
			c.stop();
			return resolve(room);
		}
	});
});

Template.ForwardMessage.events({
	
	async 'submit #forward-m, click .js-save-dm'(event, instance) {
		event.preventDefault();

		const room = instance.selectedRoom.get()
		const result = await call('forwardMessage', this.messageId, this.permalink, room);
		this.onForward(result)

	},
});

Template.ForwardMessage.onRendered(function() {
	this.find('#forwardChannel').focus();
});

Template.ForwardMessage.onCreated(function() {
	this.selectedUsers = new ReactiveVar([]);
	const { messageId, permalink, onForward } = this.data;
	

	this.selectedRoom = new ReactiveVar([]);

	// Удаляем запись при клюке на крестик
	this.onClickTagRoom = () => {
		this.selectedRoom.set([]);
	};
	this.deleteLastItemRoom = () => {
		this.selectedRoom.set([]);
	};

	this.onSelectRoom = async ({ item: room }) => {
		this.selectedRoom.set([room]);
	};

});
