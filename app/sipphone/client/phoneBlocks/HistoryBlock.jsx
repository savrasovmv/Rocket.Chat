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

export const HistoryBlock = ({ handleCall, callsHistory }) => {
  const formatDate = useFormatDateAndTime()
  //console.log('callsHistory', callsHistory)

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Sidebar.Section.Title>История звонков</Sidebar.Section.Title>
      <Scrollable smooth>
        <Tile padding="none" elevation="0" height="100%">
          {callsHistory
            ? callsHistory.map(
                ({ number, displayName, direction, createdAt, status, _id }) => (
                  <div key={_id}>
                    <Box position="relative" minWidth={350}>
                      <Option>
                        <Option.Content>
                          <Box
                            color={status === 'missed' ? 'danger' : 'default'}
                          >
                            <Icon
                              name={
                                direction === 'incoming'
                                  ? 'arrow-fall'
                                  : 'arrow-rise'
                              }
                            />
                            {displayName} - {number}
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
                      </Option>
                    </Box>
                  </div>
                )
              )
            : null}
        </Tile>
      </Scrollable>
    </Box>
  )
}

HistoryBlock.propTypes = {
  //calls: PropTypes.any,
  //handleLists: PropTypes.any,
}

export default HistoryBlock
