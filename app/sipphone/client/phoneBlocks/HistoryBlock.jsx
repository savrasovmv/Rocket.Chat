import React, { useState, useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import PropTypes from 'prop-types'
import {
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Button,
  Icon,
} from '@rocket.chat/fuselage'
import moment from 'moment'
import { useFormatDateAndTime } from '../../../../client/hooks/useFormatDateAndTime'

//import { SipHistoryCollection } from '../api/SipHistory';
import { SipHistoryCollection } from '../../db/SipHistory'

//const handleLists = Meteor.subscribe('siphistory.lists')

/*Tracker.autorun(() => {
	Meteor.subscribe('siphistory.lists')
	console.log("SipHistoryCollection");
	console.log(SipHistoryCollection);
  //const areReady = handleLists.ready();
  //console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
});*/
/*Tracker.autorun(() => {
	console.log('Update siphistory+++++++++++++++');
	console.log(SipHistoryCollection.find({}).fetch())
	if (handleLists.ready) {

  		//setSiphistory(SipHistoryCollection.find({}).fetch());
		}
});*/

export const HistoryBlock = ({ calls, handleLists, handleCall }) => {
  const [siphistory, setSiphistory] = useState([
    { text: 'Нет истории', _id: 0 },
  ])

  //const SipHistoryCollection = new Mongo.Collection('sip_history');

  //if (handleLists.ready) {
  //const siphistory = SipHistoryCollection.find({}).fetch();

  //setSiphistory(SipHistoryCollection.find({}).fetch());
  //}
  /*	Tracker.autorun(() => {
		const handleLists = Meteor.subscribe('siphistory.lists');
		if (handleLists.ready) {

			//setSiphistory(SipHistoryCollection.find({}).fetch());
		}
	      console.log('Update siphistory+++++++++++++++');
	      console.log(SipHistoryCollection.find({}).fetch())


	})*/

  /*	Tracker.autorun(() => {
		const handleLists = Meteor.subscribe('siphistory.lists')
		console.log("SipHistoryCollection");
		console.log(SipHistoryCollection);
		console.log(handleLists);

	  //const areReady = handleLists.ready();
	  //console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
	});
*/
  /*console.log("siphistory")
	console.log(siphistory)

*/

  const formatDate = useFormatDateAndTime()

  useEffect(() => {
    //const handleLists = Meteor.subscribe('siphistory.lists')
    console.log('Update handleLists.ready')
    console.log(SipHistoryCollection.find({}).fetch())
    //const siphistory = SipHistoryCollection.find({}).fetch();
    //if (handleLists.ready) {

    setSiphistory(SipHistoryCollection.find({}).fetch())
    //}
  }, [handleLists.ready])

  return (
    <div className="flex-row">
      <div className="flex-column">
        <Sidebar.Section.Title>История звонков</Sidebar.Section.Title>
        {siphistory.map(({ number, direction, createdAt, status, _id }) => (
          <div key={_id}>
            <Box position="relative" maxWidth={350}>
              <Option>
                <Option.Content>
                  <Box color={status === 'missed' ? 'danger' : 'default'}>
                    <Icon
                      name={
                        direction === 'incoming' ? 'arrow-fall' : 'arrow-rise'
                      }
                    />
                    {number}
                  </Box>
                </Option.Content>
                <Option.Content>
                  <Box>{formatDate(createdAt)}</Box>
                </Option.Content>
                <Option.Menu>
                  <Button
                    square
                    onClick={(e) => handleCall(number, e)}
                    value={number}
                  >
                    <Icon color="success" name="phone" size="x20" />
                  </Button>
                </Option.Menu>
                <Option.Menu>
                  <Button
                    square
                    onClick={(e) => handleCall(number, e)}
                    value={number}
                  >
                    <Icon color="warning" name="star" size="x20" />
                  </Button>
                </Option.Menu>
              </Option>
            </Box>
          </div>
        ))}
      </div>
    </div>
  )
}

HistoryBlock.propTypes = {
  calls: PropTypes.any,
  handleLists: PropTypes.any,
}

export default HistoryBlock
