import React, { useState, useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
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
//const listHistory = Meteor.subscribe('siphistory.lists5')
const getHistory = () => {
  return SipHistoryCollection.find({}, { limit: 5, sort: { createdAt: -1 } })
}

export const HistoryBlock = ({ handleCall, callsHistory }) => {
  // const [sipHistoryList, setSipHistoryList] = useState([
  //   { text: 'Нет истории', _id: 0 },
  // ])

  //const [siphistory, setSiphistory] = useState(getHistory())
  console.log('HistoryBlak ', callsHistory)
  const formatDate = useFormatDateAndTime()
  // const siphistory1 = SipHistoryCollection.find({})
  // console.log('Update handleLists.ready1', siphistory1)
  // Tracker.autorun(() => {
  //   setSiphistory(getHistory())
  // })
  // useEffect(() => {
  //   //setSiphistory(getHistory())
  //   //const handleLists = Meteor.subscribe('siphistory.lists')
  //   // console.log(SipHistoryCollection.find({}).fetch())
  //   // const siphistory1 = SipHistoryCollection.find({})
  //   // console.log('Update handleLists.ready2', siphistory1)
  //   //if (handleLists.ready) {
  //   // setSiphistory(SipHistoryCollection.find({}).fetch())
  //   //}
  //   // setSipHistoryList
  // }, [sipHistory])
  // useEffect(() => {
  //   //const handleLists = Meteor.subscribe('siphistory.lists')
  //   // console.log('Update handleLists.ready')
  //   // console.log(SipHistoryCollection.find({}).fetch())
  //   //const siphistory = SipHistoryCollection.find({}).fetch();
  //   //if (handleLists.ready) {
  //   // setSiphistory(SipHistoryCollection.find({}).fetch())
  //   //}
  // }, [handleLists.ready])

  // useEffect(() => {
  //   //const handleLists = Meteor.subscribe('siphistory.lists')
  //   // console.log('Update handleLists.ready')
  //   // console.log(SipHistoryCollection.find({}).fetch())
  //   //const siphistory = SipHistoryCollection.find({}).fetch();
  //   //if (handleLists.ready) {
  //   // setSiphistory(SipHistoryCollection.find({}).fetch())
  //   //}
  // }, [handleLists.ready])

  return (
    <div className="flex-row">
      <div className="flex-column">
        <Sidebar.Section.Title>История звонков</Sidebar.Section.Title>
        {callsHistory
          ? callsHistory.map(
              ({ number, direction, createdAt, status, _id }) => (
                <div key={_id}>
                  <Box position="relative" maxWidth={350}>
                    <Option>
                      <Option.Content>
                        <Box color={status === 'missed' ? 'danger' : 'default'}>
                          <Icon
                            name={
                              direction === 'incoming'
                                ? 'arrow-fall'
                                : 'arrow-rise'
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
              )
            )
          : null}
      </div>
    </div>
  )
}

HistoryBlock.propTypes = {
  //calls: PropTypes.any,
  //handleLists: PropTypes.any,
}

export default HistoryBlock
