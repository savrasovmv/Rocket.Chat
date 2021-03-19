import React, { Fragment, useState, useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import PropTypes from 'prop-types'
import { SearchInput, Button, Icon } from '@rocket.chat/fuselage'
import {
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Label,
  Scrollable,
  Tile,
  Tabs,
  Tooltip,
} from '@rocket.chat/fuselage'

import SearchList from '../../../client/sidebar/search/SearchList'
import { useOutsideClick } from '../../../client/hooks/useOutsideClick'
import { useMutableCallback } from '@rocket.chat/fuselage-hooks'
import { APIClient } from '../../utils/client'

import { Users } from '../../models/client'

import {
  ButtonPanel,
  CallButton,
  EndButton,
  HoldButton,
  MicButton,
  TransferButton,
  AttendedTransferButton,
  AttendedTransferButtonFinish,
  DialButton,
} from './phoneBlocks/Buttons.jsx'
import { KeypadBlock } from './phoneBlocks/KeypadBlock.jsx'
import { InfoBlock } from './phoneBlocks/InfoBlock.jsx'
import { LineBlock } from './phoneBlocks/LineBlock.jsx'
import { SearchBlock } from './phoneBlocks/SearchBlock.jsx'

const call_icon = '/icons/call-icon.svg'
const end_icon = '/icons/end-icon.svg'
const mute_icon = '/icons/mute-icon.svg'
const unmute_icon = '/icons/unmute-icon.svg'
const pause_icon = '/icons/pause-icon.svg'
const play_icon = '/icons/play-icon.svg'

//import './main.css';

// export const LineButton = ({
//   localStatePhone,
//   displayCall,
//   handleTabLine,
//   activeChannelNumber,
// }) => {
//   const [className, setclassName] = useState('tab-sipline ')

//   useEffect(() => {
//     console.log('----localStatePhone  BLOCK')
//     newclassName = 'tab-sipline '
//     if (activeChannelNumber === displayCall.id) {
//       newclassName += ' active '
//     }
//     if (displayCall.inCall === true) {
//       newclassName += ' tab-sipline-incall '
//     }
//     setclassName(newclassName)
//   }, [localStatePhone, activeChannelNumber])

//   return (
//     <div>
//       <button
//         className={className}
//         value={displayCall.id}
//         onClick={handleTabLine}
//       >
//         Линия {displayCall.id + 1}
//       </button>
//     </div>
//   )
// }

export const PhoneBlock = ({
  handleCallAttendedTransfer,
  handleCallTransfer,
  handleMicMute,
  handleHold,
  handleCall,
  handleEndCall,
  handlePressKey,
  activeChannelNumber,
  activeChannel,
  handleSettingsButton,
  dialState,
  setdialState,
  handleDialStateChange,
  setLocalStatePhone,
  setActiveChannel,
  localStatePhone,
}) => {
  const {
    inCall,
    muted,
    hold,
    sessionId,
    inAnswer,
    allowTransfer,
    allowAttendedTransfer,
    inAnswerTransfer,
    inConference,
    inTransfer,
    transferControl,
  } = activeChannel

  const [viewKeyPad, setView] = useState(false)

  const handleDial = () => setView((prev) => !prev)

  // const handleDial = (event) => {
  //   if (viewKeyPad === false) {
  //     setView(true)
  //   } else {
  //     setView(false)
  //   }
  // }

  const handleTabChange = (event, newValue) => {
    newValue = event.currentTarget.value

    setActiveChannel(newValue)
  }

  const handleTabLine = (lineId) => {
    newValue = parseInt(lineId)

    setActiveChannel(newValue)
  }

  const handleSearchCall = (number = '', event) => {
    setdialState(number)
    setUsers([])

    setOpenSearch(false)
  }

  const [openSearch, setOpenSearch] = useState(false)

  const [typeNumSearch, setTypeNumSearch] = useState(true)
  const [users, setUsers] = useState([])
  const handleSearch = (event) => {
    setOpenSearch(true)
    setdialState(event.target.value)
  }

  useEffect(() => {
    //console.log('Update search')
    if (openSearch && !inCall) {
      const arr = []
      //console.log('Update search')
      if (dialState) {
        // console.log('====================================')
        if (/^[0-9]+$/.test(dialState)) {
          //console.log('Введены цифры')
          setTypeNumSearch(true)
        } else {
          //console.log('Введены буквы')
          setTypeNumSearch(false)
        }
        //"telephoneNumber":"telephoneNumber","ipPhone":"ipPhone","mobile":"mobile","homePhone":"homePhone"}
        const result = APIClient.v1.get('users.list', {
          /* prettier-ignore */
          query: '{ \
                                "$and":[\
                                        {"$or": [\
                                              {"ipPhone": {"$ne": null}},\
                                              {"telephoneNumber": {"$ne": null}},\
                                              {"mobile": {"$ne": null}},\
                                              {"homePhone": {"$ne": null}}\
                                              ]\
                                        },\
                                        {\
                                          "$or": [\
                                              {"ipPhone": {"$regex": "'+dialState+'" }},\
                                              {"telephoneNumber": {"$regex": "'+dialState+'" }},\
                                              {"mobile": {"$regex": "'+dialState+'" }},\
                                              {"homePhone": {"$regex": "'+dialState+'" }},\
                                              {"name": {"$regex": "'+dialState+'" , "$options": "i"}}\
                                              ] \
                                        }\
                                  ]\
                              }',
        })

        result.then((resolve) => {
          setUsers(resolve.users)
        })
      } else {
        setUsers([])
      }
    }
  }, [dialState])

  const [searchOpen, setSearchOpen] = useState(false)

  console.log('Render')
  return (
    <Fragment>
      <Box display="flex" justifyContent="center" margin="x16">
        <SearchInput
          maxWidth={500}
          placeholder="Номер или имя абонента"
          value={dialState}
          onChange={handleSearch}
        />

        {!inCall ? (
          <Button primary success onClick={handleCall} minWidth="x100" mis="x5">
            {' '}
            <Icon name="phone" size="x20" />
          </Button>
        ) : null}
      </Box>
      <Box display="flex" justifyContent="center">
        <Box
          paddingInlineEnd="x100"
          style={{
            position: 'absolute',
            zIndex: '3',
            insetInlineEnd: 'neg-x5',
            //insetBlockStart: 'neg-x8',
          }}
        >
          {users.length > 0 ? (
            <Scrollable smooth>
              <Tile padding="none" height={300}>
                <Box display="flex" flexDirection="column">
                  <SearchBlock
                    handleSearchCall={handleSearchCall}
                    users={users}
                    typeNumSearch={typeNumSearch}
                    search={dialState}
                  />
                </Box>
              </Tile>
            </Scrollable>
          ) : null}
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" margin="x16">
        <Tabs>
          {localStatePhone.displayCalls.map((displayCall, key) => (
            <Tabs.Item
              selected={activeChannelNumber === displayCall.id ? true : false}
              onClick={() => handleTabLine(displayCall.id)}
              key={displayCall.id}
              color={
                displayCall.hold
                  ? 'warning'
                  : displayCall.inCall === true
                  ? 'primary'
                  : 'hint'
              }
            >
              Линия {displayCall.id + 1}{' '}
            </Tabs.Item>
          ))}
        </Tabs>
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        bg={inCall ? 'hint' : 'alternative'}
      >
        {localStatePhone.displayCalls.map((displayCall, key) => (
          <Box
            display={activeChannelNumber === displayCall.id ? 'flex' : 'none'}
            flexDirection="column"
            justifyContent="center"
            m="x10"
            key={displayCall.id}
          >
            {/* Группа кнопок */}
            <Box display="flex" flexDirection="row">
              {/* Кнопа цифровой панели */}

              <Box
                size="x90"
                fontSize="x12"
                lineHeight="1.25"
                color="info"
                is={Button}
                margin="x1"
                onClick={handleDial}
              >
                <Box>
                  <Icon name="dialpad" size="x36" />
                </Box>

                <Box>
                  <small>Книпки</small>
                </Box>
                <Box>
                  <small>набора</small>
                </Box>
              </Box>
              {/* Кнопа микрофона */}

              <Box
                size="x90"
                fontSize="x12"
                lineHeight="1.25"
                color="info"
                is={Button}
                margin="x1"
                disabled={inCall ? false : true}
                onClick={handleMicMute}
                fontSize="x12"
              >
                <Box>
                  <Icon name={muted ? 'mic-off' : 'mic'} size="x36" />
                </Box>

                <Box>
                  <small>Вкл/Выкл</small>
                </Box>
                <Box>
                  <small>микрофон</small>
                </Box>
              </Box>
              {/* Кнопа удержания */}

              <Box
                size="x90"
                fontSize="x12"
                lineHeight="1.25"
                color="info"
                is={Button}
                margin="x1"
                disabled={inCall ? false : true}
                onClick={() => handleHold(displayCall.sessionId)}
              >
                <Box>
                  <Icon name={hold ? 'play' : 'pause'} size="x36" />
                </Box>

                <Box>
                  <small>Удержание</small>
                </Box>
                <Box>
                  <small>вызова</small>
                </Box>
              </Box>
              {/* <Tooltip  placement="bottom-start"> Удержание вызова </Tooltip> */}
              {!displayCall.transferControl ? (
                <Fragment>
                  {!displayCall.inTransfer ? (
                    <Fragment>
                      <Box
                        size="x90"
                        fontSize="x12"
                        lineHeight="1.25"
                        color="info"
                        is={Button}
                        margin="x1"
                        disabled={
                          !displayCall.allowTransfer || !displayCall.inCall
                            ? true
                            : false
                        }
                        onClick={handleCallTransfer}
                      >
                        <Box>
                          <Icon name="arrow-jump" size="x36" />
                        </Box>

                        <Box>
                          <small>Перевод</small>
                        </Box>
                        <Box>
                          <small>звонка</small>
                        </Box>
                      </Box>

                      <Box
                        size="x90"
                        fontSize="x12"
                        lineHeight="1.25"
                        color="info"
                        is={Button}
                        margin="x1"
                        disabled={
                          !displayCall.allowTransfer || !displayCall.inCall
                            ? true
                            : false
                        }
                        onClick={() => handleCallAttendedTransfer('transfer')}
                      >
                        <Box>
                          <Icon name="arrow-loop" size="x36" />
                        </Box>
                        <Box>
                          <small>Сопр.</small>
                        </Box>
                        <Box>
                          <small>перевод</small>
                        </Box>
                      </Box>
                    </Fragment>
                  ) : (
                    <Box
                      size="x90"
                      fontSize="x12"
                      lineHeight="1.25"
                      color="info"
                      is={Button}
                      margin="x1"
                      onClick={() => handleCallAttendedTransfer('cancel')}
                    >
                      <Box>
                        <Icon name="cancel" size="x36" />
                      </Box>

                      <Box>
                        <small>Отменить</small>
                      </Box>
                      <Box>
                        <small>перевод</small>
                      </Box>
                    </Box>
                  )}
                </Fragment>
              ) : (
                <Box
                  size="x90"
                  fontSize="x12"
                  lineHeight="1.25"
                  color="info"
                  is={Button}
                  margin="x1"
                  disabled={displayCall.allowFinishTransfer ? false : true}
                  onClick={() => handleCallAttendedTransfer('finish')}
                >
                  <Box>
                    <Icon name="arrow-collapse" size="x36" />
                  </Box>

                  <Box>
                    <small>Завершить</small>
                  </Box>
                  <Box>
                    <small>перевод</small>
                  </Box>
                </Box>
              )}
            </Box>
            <Box display="flex" justifyContent="center">
              <KeypadBlock
                viewKeyPad={viewKeyPad}
                handlePressKey={handlePressKey}
              />
            </Box>
            <Box display="flex" justifyContent="center">
              <InfoBlock
                displayCall={displayCall}
                localStatePhone={localStatePhone}
                activeChannelNumber={activeChannelNumber}
                setActiveChannel={setActiveChannel}
              />
            </Box>
            <Box display="flex" justifyContent="center">
              {displayCall.inCall ? (
                <Button
                  mi="5"
                  minWidth="x100"
                  primary
                  danger
                  onClick={handleEndCall}
                >
                  <Icon name="phone-off" size="x20" />
                </Button>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    </Fragment>
  )
}

PhoneBlock.propTypes = {
  handleCallAttendedTransfer: PropTypes.any,
  handleCallTransfer: PropTypes.any,
  handleMicMute: PropTypes.any,
  handleHold: PropTypes.any,
  handleCall: PropTypes.any,
  handleEndCall: PropTypes.any,
  handlePressKey: PropTypes.any,
  activeChannelNumber: PropTypes.any,
  activeChanel: PropTypes.any,
  keyVariant: PropTypes.any,
  handleSettingsButton: PropTypes.any,
  dialState: PropTypes.any,
  setdialState: PropTypes.any,
  handleDialStateChange: PropTypes.any,
  setLocalStatePhone: PropTypes.any,
  setActiveChannel: PropTypes.any,
  localStatePhone: PropTypes.any,
  typeNumSearch: PropTypes.any,
  users: PropTypes.any,
  search: PropTypes.any,
}

export default PhoneBlock
