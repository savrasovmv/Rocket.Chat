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
  ButtonGroup,
  Icon,
  Scrollable,
  Tile,
} from '@rocket.chat/fuselage'
import moment from 'moment'
import { useFormatDateAndTime } from '../../../../client/hooks/useFormatDateAndTime'
import Discovery from 'aws-sdk/clients/discovery'

export const HistoryBlock = ({ handleCall, handleFavorites, callsHistory, favorites }) => {
  //const formatDate = useFormatDateAndTime()
  //console.log('callsHistory', callsHistory)
  const toDay = moment().startOf('day')


  const formatDate = (date) => {
    if (moment(date).isSame(toDay, 'day')) {
      return moment(date).format('HH:mm');
    }
    return moment(date).format('D MMMM Y HH:mm');
  }

  const formatTime = (duration) => {
    if (!duration) return '0:00'
    var timestamp = duration;

    // 2
    //var hours = Math.floor(timestamp / 60 / 60);

    // 37
    var minutes = Math.floor(timestamp / 60)

    // 42
    var seconds = timestamp % 60;

    let res = ''
    // res += hours>0 ? hours + 'ч ' : ''
    // res += minutes>0 || hours>0 ? minutes + 'мин ' : ''
    // res += seconds>0 ? seconds + 'с ' : ''

    res =  minutes + ':' + seconds.toString().padStart(2, '0')

    // var formatted = [
    //   hours.toString().padStart(2, '0'),
    //   minutes.toString().padStart(2, '0'),
    //   seconds.toString().padStart(2, '0')
    // ].join(':')

    return res;
  }

  const isFavorites = (number) => {
    res = favorites.find((el) => el.number === number)
    return res ? true : false

  }

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} >
      <Sidebar.Section.Title>История звонков</Sidebar.Section.Title>
      {/* <Scrollable vertical>
        <Tile padding="none" elevation="1" height={200} >

          <Box height='1000%' >5456465 </Box>
        </Tile>
      </Scrollable> */}
      <Box display="flex" flexGrow={1}>
      <Scrollable vertical>
        <Box display="flex" flexDirection="column" flexGrow={1} minHeight={100}>
        <Tile padding='none' maxWidth='full' h={0}>
          {callsHistory
            ? callsHistory.map(
                ({ number, displayName, direction, duration, createdAt, status, _id }) => (
                    <div key={_id}>
                      <Option>
                      <Option.Content>
                        <Box
                              display="flex"
                              flexDirection="row"
                              color={status === 'missed' ? 'danger' : 'default'}
                              style={{justifyContent: "space-between"}}

                            >
                              <Box display="flex"  flexDirection="row">

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
                                    <Box color={status === 'missed' ? 'danger' : 'default'}>
                                        {displayName ? displayName : number}
                                    </Box>
                                    <Box color={status === 'missed' ? 'danger' : 'info'}>
                                      {displayName ? number : null}
                                    </Box>
                                  </Box>

                              </Box>

                              <Box
                                display="flex"
                                flexDirection="row"
                                verticalAlign='middle'
                                style={{justifyContent: "space-end"}}
                                color={status === 'missed' ? 'danger' : 'info'}
                                >

                                  <Box display="flex" fontSize='x12' p={5} pb={10} flexGrow={1} textAlign='end' >{formatDate(createdAt)}</Box>
                                  <Box display="flex" fontSize='x12' p={5} pb={10} flexGrow={1} textAlign='end' minWidth='50px'>
                                    {status === 'not answered' ? (
                                        '-'
                                      ): (
                                        <em>{formatTime(duration)}</em>
                                    )}
                                  </Box>

                                  <Box display="flex" flexGrow={1} w="80px">

                                    <Option.Menu>
                                      <ButtonGroup align='end'>
                                              <Button
                                                small square
                                                onClick={(e) => handleCall(number, e)}
                                                value={number}
                                              >
                                                <Icon color="success" name="phone" size='x24' />
                                              </Button>
                                              <Button
                                                small square
                                                onClick={(e) => handleFavorites(displayName, number)}
                                                value={number}
                                              >
                                                {isFavorites(number) ? (

                                                  <Icon color="warning" name="star" size='x24'/>

                                                  ):(

                                                    <Icon color="info" name="star" size='x24'/>

                                                )}
                                              </Button>
                                              </ButtonGroup>
                                      </Option.Menu>
                                  </Box>

                              </Box>

                          </Box>

                      </Option.Content>

                      {/* <Option.Content flexGrow={3}>
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
                              <Box display="flex" flexDirection="row">
                                {displayName ? number : null}
                              </Box>
                          </Box>
                          </Box>
                        </Option.Content>


                        <Option.Content>
                          <Box fontSize='x12'>{formatDate(createdAt)}</Box>
                        </Option.Content>
                        <Option.Content>
                        <Option.Menu>
                        <ButtonGroup align='end'>
                                <Button
                                  small square
                                  onClick={(e) => handleCall(number, e)}
                                  value={number}
                                >
                                  <Icon color="warning" name="star" />
                                </Button>
                                <Button
                                  small square
                                  onClick={(e) => handleCall(number, e)}
                                  value={number}
                                >
                                  <Icon color="success" name="phone" />
                                </Button>
                                </ButtonGroup>
                        </Option.Menu>

                        </Option.Content> */}
                      </Option>
                    </div>
                )
              )
            : null}
          </Tile>
        </Box>
      </Scrollable>
      </Box>
    </Box>
  )
}

HistoryBlock.propTypes = {
  //calls: PropTypes.any,
  //handleLists: PropTypes.any,
}

export default HistoryBlock
