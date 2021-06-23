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
  Scrollable,
  Tile,
} from '@rocket.chat/fuselage'
import moment from 'moment'
import { useFormatDateAndTime } from '../../../../client/hooks/useFormatDateAndTime'
import Discovery from 'aws-sdk/clients/discovery'

export const HistoryBlock = ({ handleCall, callsHistory }) => {
  //const formatDate = useFormatDateAndTime()
  //console.log('callsHistory', callsHistory)
  const toDay = moment().startOf('day')


  const formatDate = (date) => {
    if (moment(date).isSame(toDay, 'day')) {
      return moment(date).format('HH:mm');
    }
    return moment(date).format('D MMMM Y HH:mm');
  }

  return (
    <Box display="flex" flexDirection="column" bg='neutral-500'>
      <Sidebar.Section.Title>История звонков</Sidebar.Section.Title>
      {/* <Scrollable vertical>
        <Tile padding="none" elevation="1" height={200} >

          <Box height='1000%' >5456465 </Box>
        </Tile>
      </Scrollable> */}
      {/* <Scrollable vertical> */}
        <div padding="none" display="flex" flexDirection="column"  maxWidth='full' elevation="0" flexGrow={1} inset='x1' className="history">
          {callsHistory
            ? callsHistory.map(
                ({ number, displayName, direction, createdAt, status, _id }) => (
                    <div key={_id}>
                      <div>{displayName ? displayName : number}</div>
                      <div>{displayName ? displayName : number}</div>
                      <div>{displayName ? displayName : number}</div>
                      {/* <Option>
                      <Option.Content>
                          <Box
                            display="flex"
                            flexDirection="row"
                            color={status === 'missed' ? 'danger' : 'default'}
                          >
                            <Box>
                            <Icon
                              name={
                                direction === 'incoming'
                                  ? 'arrow-fall'
                                  : 'arrow-rise'
                              }
                            />
                            </Box>
                            <Box display="flex" flexDirection="column">
                              <Box>{displayName ? displayName : number}</Box>
                              <Box>{displayName ? number : null}</Box>

                            </Box>
                          </Box>
                        </Option.Content>
                        <Option.Content>
                          <Box
                            color={status === 'missed' ? 'danger' : 'default'}
                          >

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
                            <Icon color="success" name="phone" />
                          </Button>
                        </Option.Menu>
                        <Option.Menu>
                          <Button
                            square
                            onClick={(e) => handleCall(number, e)}
                            value={number}
                          >
                            <Icon color="warning" name="star" />
                          </Button>
                        </Option.Menu>
                      </Option> */}
                    </div>
                )
              )
            : null}
        </div>
      {/* </Scrollable> */}
    </Box>
  )
}

HistoryBlock.propTypes = {
  //calls: PropTypes.any,
  //handleLists: PropTypes.any,
}

export default HistoryBlock
