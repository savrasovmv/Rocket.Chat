import React, {
  Fragment,
  useState,
  useEffect,
  createRef,
  useCallback,
  useMemo,
} from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import CallsFlowControl from './CallsFlowControl'
import { SipPhone } from './SipSideNavBlock'
import { StatusBlock } from './phoneBlocks/StatusBlock'
import { CallQueue } from './phoneBlocks/CallQueue'
import { KeypadBlock } from './phoneBlocks/KeypadBlock'
import { HistoryBlock } from './phoneBlocks/HistoryBlock'
import SwipeCaruselBlock from './phoneBlocks/SwipeCaruselBlock'
import { SettingsBlock } from './phoneBlocks/SettingsBlock'

import { WebSocketInterface } from 'jssip'
import _ from 'lodash'
import { NavBar } from './NavBar.jsx'
import { PhoneBlock } from './PhoneBlock.jsx'

import PropTypes from 'prop-types'
import { APIClient } from '../../utils/client'
import { useSetting } from '../../../client/contexts/SettingsContext'
import {
  Box,
  StatusBullet,
  Label,
  Banner,
  Icon,
  Callout,
  Divider,
} from '@rocket.chat/fuselage'
//import { SipHistoryCollection } from '../db/SipHistory'
import { SipProvider, useSip } from './SipContext'

import { setMissedSIP, setStatusSIP } from './lib/streamer'

//const SIPPhone_domain = useSetting('SIPPhone_domain')
//console.log('SIPPhone_domain')
//console.log(SIPPhone_domain)

var transferLine = ''
/*const config = {
  domain: 'fs2.fineapple.xyz', // sip-server@your-domain.io
  uri: 'sip:1011@fs2.fineapple.xyz', // sip:sip-user@your-domain.io
  password: 'Gfhjkm12@', //  PASSWORD ,
  ws_servers: 'https://fs2.fineapple.xyz:7443', //ws server
  sockets: new WebSocketInterface('wss://fs2.fineapple.xyz:7443'),
  display_name: '1011', //jssip Display Name
  debug: true, // Turn debug messages on
  stun_servers: ['stun.l.google.com:19302', 'stun4.l.google.com:19302,'],
}*/
/*const config = {
    domain: 'fs.tmenergo.ru', // sip-server@your-domain.io
    uri: 'sip:1003@fs.tmenergo.ru', // sip:sip-user@your-domain.io
    password: 'Gfhjkm12@', //  PASSWORD ,
    ws_servers: 'https://fs.tmenergo.ru:7443', //ws server
    sockets: new WebSocketInterface('wss://fs.tmenergo.ru:7443'),
    display_name: '1003',//jssip Display Name
    debug: true // Turn debug messages on

};*/
/*const config = {
    domain: 'sip2.fineapple.xyz', // sip-server@your-domain.io
    uri: 'sip:110_webrtc@sip2.fineapple.xyz', // sip:sip-user@your-domain.io
    password: 'Gfhjkm12@', //  PASSWORD ,
    //ws_servers: '[{"ws_uri":"wss://sip2.fineapple.xyz/ws","sip_uri":"<sip:sip2.fineapple.xyz;transport=ws;lr>","weight":0,"status":0,"scheme":"WSS"}]', //ws server
    ws_servers: 'wss://sip2.fineapple.xyz/ws', //ws server
    sockets: new WebSocketInterface('wss://sip2.fineapple.xyz/ws'),
    display_name: '110',//jssip Display Name
    debug: true // Turn debug messages on

};*/
/*const config = {
    domain: 'sip.tmenergo.ru', // sip-server@your-domain.io
    uri: 'sip:savrasovmv@sip.tmenergo.ru:8082', // sip:sip-user@your-domain.io
    password: 'KtdNjkcnjq1', //  PASSWORD ,
    ws_servers: 'wss://sip.tmenergo.ru:8082/ws', //ws server
    sockets: new WebSocketInterface('wss://sip.tmenergo.ru:8082/ws'),
    display_name: '110',//jssip Display Name
    debug: true // Turn debug messages on

};*/
const flowRoute = new CallsFlowControl()
const player = createRef() //элемент звука
const ringer = createRef() //элемент для рингтона
const dialState = '1002'
export const SoftPhone = ({
  config,
  ipPhone,
  callVolume = 80,
  ringVolume = 80,
  setCallVolume = 80,
  setRingVolume = 80,
  setConnectOnStartToLocalStorage = true,
  setNotifications = true,
  notifications = true,
  connectOnStart = true,
  timelocale = 'UTC',
}) => {
  // const config = {
  //   domain: sipDomain, //'fs2.fineapple.xyz', // sip-server@your-domain.io
  //   uri: 'sip:1011@' + sipDomain, // sip:sip-user@your-domain.io
  //   password: 'Gfhjkm12@', //  PASSWORD ,
  //   ws_servers: 'https://' + wsServers + ':' + wsPort, //'https://fs2.fineapple.xyz:7443', //ws server
  //   sockets: new WebSocketInterface('wss://' + sipDomain + ':' + wsPort),
  //   display_name: '1011', //jssip Display Name
  //   debug: true, // Turn debug messages on
  //   stun_servers: stunServers.split(','),
  // }
  // console.log('SIPPhone config')
  //console.log('SoftPhone ipPhone', ipPhone)

  const defaultSoftPhoneState = {
    displayCalls: [
      {
        id: 0,
        info: 'Ch 1',
        hold: false,
        muted: 0,
        autoMute: 0,
        inCall: false,
        inAnswer: false,
        inTransfer: false,
        callInfo: 'Ready',
        inAnswerTransfer: false,
        allowTransfer: true,
        transferControl: false,
        allowAttendedTransfer: true,
        transferNumber: '',
        attendedTransferOnline: '',
        inConference: false,
        callNumber: '',
        duration: 0,
        side: '',
        sessionId: '',
      },
      {
        id: 1,
        info: 'Ch 2',
        hold: false,
        muted: 0,
        autoMute: 0,
        inCall: false,
        inAnswer: false,
        inAnswerTransfer: false,
        inConference: false,
        inTransfer: false,
        callInfo: 'Ready',
        allowTransfer: true,
        transferControl: false,
        allowAttendedTransfer: true,
        transferNumber: '',
        attendedTransferOnline: '',
        callNumber: '',
        duration: 0,
        side: '',
        sessionId: '',
      },
      {
        id: 2,
        info: 'Ch 3',
        hold: false,
        muted: 0,
        autoMute: 0,
        inCall: false,
        inConference: false,
        inAnswer: false,
        callInfo: 'Ready',
        inTransfer: false,
        inAnswerTransfer: false,
        Transfer: false,
        allowTransfer: true,
        transferControl: false,
        allowAttendedTransfer: true,
        transferNumber: '',
        attendedTransferOnline: '',
        callNumber: '',
        duration: 0,
        side: '',
        sessionId: '',
      },
    ],
    phoneConnectOnStart: connectOnStart,
    notifications,
    phoneCalls: [],
    connectedPhone: false,
    connectingPhone: false,
    activeCalls: [],
    callVolume: 80,
    ringVolume: 80,
  }

  const getInputDevices = () => {
    //event.persist();
    var value = localStorage.defaultInDevices
    if (!value) {
      localStorage.defaultInDevices = true
      console.log('Не назначено устройство ввода по умолчанию')
      return true
    }

    return value
  }
  const getDefaultInDevices = () => {
    //event.persist();
    var value = getInputDevices()
    if (value === true) {
      console.log('Устройство ввода по умолчанию')
      return true
    } else {
      return { deviceId: value }
    }
    //console.log('value IN')
    //console.log(value)
    return value
  }
  const getDefaultOutDevices = () => {
    //event.persist();
    var value = localStorage.defaultOutDevices
    if (!value) {
      localStorage.defaultOutDevices = ''
    }
    //console.log("value OUT")
    //console.log(value)

    return value
  }

  const [drawerOpen, drawerSetOpen] = useState(false)
  const [dialState, setdialState] = useState('')
  const [activeChannelNumber, setActiveChannel] = useState(0)
  const [localStatePhone, setLocalStatePhone] = useState(defaultSoftPhoneState)
  const [notificationState, setNotificationState] = useState({
    open: false,
    message: '',
  })
  const [calls, setCalls] = useState([])
  const [callsHistory, setCallsHistory] = useState([])
  const [localMediaDevices, setlocalMediaDevices] = useState(false)
  const [inputDevices, setInputDevices] = useState(getDefaultInDevices())
  const [outputDevices, setOutputDevices] = useState(getDefaultOutDevices())
  const [isSettings, setIsSettings] = useState(false)

  const hangleSettings = () => {
    setInputDevices(getDefaultInDevices())
    setOutputDevices(getDefaultOutDevices())
  }

  const notify = (message) => {
    setNotificationState((notification) => ({
      ...notification,
      open: true,
      message,
    }))
  }
  Notification.requestPermission()
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setNotificationState((notification) => ({ ...notification, open: false }))
  }
  flowRoute.activeChannel = localStatePhone.displayCalls[activeChannelNumber]
  flowRoute.connectedPhone = localStatePhone.connectedPhone
  flowRoute.engineEvent = (event, payload) => {
    // Listen Here for Engine "UA jssip" events
    console.log(event)
    switch (event) {
      case 'connecting':
        break
      case 'connected':
        setLocalStatePhone((prevState) => ({
          ...prevState,
          connectingPhone: false,
          connectedPhone: true,
        }))

        break
      case 'registered':
        break
      case 'disconnected':
        setLocalStatePhone((prevState) => ({
          ...prevState,
          connectingPhone: false,
          connectedPhone: false,
        }))
        break
      case 'registrationFailed':
        break

      default:
        break
    }
  }

  flowRoute.onCallActionConnection = async (type, payload, data) => {
    console.log('type', type)
    //console.log(type)
    console.log('payload', payload)
    // console.log(payload)
    console.log('data', data)
    // console.log(data)
    console.log('displayCalls', localStatePhone.displayCalls)
    // console.log(localStatePhone.displayCalls)
    switch (type) {
      case 'reinvite':
        // looks like its Attended Transfer
        // Success transfer
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) =>
            a.sessionId === payload
              ? {
                  ...a,
                  allowAttendedTransfer: true,
                  allowTransfer: true,
                  inAnswerTransfer: true,
                  inTransfer: true,
                  attendedTransferOnline: '', //data ? data.request.headers['P-Asserted-Identity'][0].raw.split(' ')[0] : null
                }
              : a
          ),
        }))

        break
      case 'incomingCall':
        // looks like new call its incoming call
        // Save new object with the Phone data of new incoming call into the array with Phone data

        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: [
            ...prevState.phoneCalls,
            {
              displayName:
                payload.remote_identity.display_name !== ''
                  ? `${payload.remote_identity.display_name || ''}`
                  : payload.remote_identity.uri.user,
              callNumber: payload.remote_identity.uri.user,
              sessionId: payload.id,
              ring: false,
              duration: 0,
              direction: payload.direction,
            },
          ],
        }))

        // callNumber:
        //         payload.remote_identity.display_name !== ''
        //           ? `${payload.remote_identity.display_name || ''}`
        //           : payload.remote_identity.uri.user,
        //       sessionId: payload.id,
        //       ring: false,
        //       duration: 0,
        //       direction: payload.direction,
        //document.visibilityState !== 'visible'
        // console.log(
        //   'STYLE====',
        //   document.getElementsByClassName('sipphone-box')[0].style.display
        // )
        if (
          (document.getElementsByClassName('sipphone-box')[0].style.display ===
            'none' ||
            document.getElementsByClassName('sipphone-box')[0].style.display ===
              '') &&
          localStatePhone.notifications
        ) {
          const notification = new Notification('Incoming Call', {
            requireInteraction: true, //Постоянно отображается
            icon: '/call-icon.png',
            body: `Входящий вызов: ${
              payload.remote_identity.display_name !== ''
                ? `${payload.remote_identity.display_name || ''}`
                : payload.remote_identity.uri.user
            }`,
          })
          notification.onclick = function () {
            document.getElementsByClassName('sipphone-box')[0].style.display =
              'flex'
            document.getElementsByClassName(
              'rc-old main-content content-background-color'
            )[0].style.display = 'none'

            handleAnswer(payload.id)
            window.parent.focus()
            window.focus() // just in case, older browsers

            this.close()
          }
        }

        document.getElementsByClassName('sipphone-box')[0].style.display = 'flex'
        document.getElementsByClassName('rc-old main-content content-background-color')[0].style.display = 'none'

        break
      case 'outgoingCall':
        // looks like new call its outgoing call
        // Create object with the Display data of new outgoing call

        const newProgressLocalStatePhone = _.cloneDeep(localStatePhone)
        newProgressLocalStatePhone.displayCalls[activeChannelNumber] = {
          ...localStatePhone.displayCalls[activeChannelNumber],
          inCall: true,
          hold: false,
          inAnswer: false,
          direction: payload.direction,
          sessionId: payload.id,
          callNumber: payload.remote_identity.uri.user,
          callInfo: 'In Call',
        }
        // Save new object into the array with display calls

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: newProgressLocalStatePhone.displayCalls,
        }))
        setdialState('')

        break
      case 'callEnded':
        // Call is ended, lets delete the call from calling queue
        // Call is ended, lets check and delete the call from  display calls list
        //        const ifExist= _.findIndex(localStatePhone.displayCalls,{sessionId:e.sessionId})
        console.log('+++++++ callEnded')


        console.log(localStatePhone)

        const firstCheck = localStatePhone.phoneCalls.filter(
          (item) => item.sessionId === payload && item.direction === 'incoming'
        )
        const secondCheck = localStatePhone.displayCalls.filter(
          (item) => item.sessionId === payload
        )
        if (firstCheck.length === 1) {
          console.log('siphistory.insert firstCheck', secondCheck[0]);
          setCalls((call) => [
            {
              status: 'missed',
              sessionId: firstCheck[0].sessionId,
              direction: firstCheck[0].direction,
              number: firstCheck[0].callNumber,
              displayName: firstCheck[0].displayName,
              time: new Date(),
            },
            ...call,
          ])
          //console.log("+++++++ callEnded=======firstCheck")
          Meteor.call(
            'siphistory.insert',
            (status = 'missed'),
            (direction = firstCheck[0].direction),
            (number = firstCheck[0].callNumber),
            (displayName = firstCheck[0].displayName)
          )

          setCallsHistory((call) => [
            {
              status: 'missed',
              direction: firstCheck[0].direction,
              number: firstCheck[0].callNumber,
              displayName: firstCheck[0].displayName,
              createdAt: new Date(),
              _id: firstCheck[0].sessionId,
            },
            ...call,
          ])
          setMissedSIP(true) //Посылаем на сервер что есть пропущенный звонок
        } else if (secondCheck.length === 1) {
          //console.log("+++++++ callEnded=======secondCheck")
          setCalls((call) => [
            {
              status: secondCheck[0].inAnswer ? 'answered' : 'missed',
              sessionId: secondCheck[0].sessionId,
              direction: secondCheck[0].direction,
              number: secondCheck[0].callNumber,
              displayName: secondCheck[0].displayName,
              time: new Date(),
            },
            ...call,
          ])
          //console.log("+++++++ callEnded=======Meteor.call(")
          console.log('siphistory.insert secondCheck', secondCheck[0]);
          Meteor.call(
            'siphistory.insert',
            (status = secondCheck[0].inAnswer ? 'answered' : 'missed'),
            (direction = secondCheck[0].direction),
            (number = secondCheck[0].callNumber),
            (displayName = secondCheck[0].displayName)
          )
          setCallsHistory((call) => [
            {
              status: secondCheck[0].inAnswer ? 'answered' : 'missed',
              direction: secondCheck[0].direction,
              number: secondCheck[0].callNumber,
              displayName: secondCheck[0].displayName,
              createdAt: new Date(),
              _id: secondCheck[0].sessionId,
            },
            ...call,
          ])
        }

        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: localStatePhone.phoneCalls.filter(
            (item) => item.sessionId !== payload
          ),
          displayCalls: _.map(localStatePhone.displayCalls, (a) =>
            a.sessionId === payload
              ? {
                  ...a,
                  inCall: false,
                  inAnswer: false,
                  hold: false,
                  muted: 0,
                  inTransfer: false,
                  inAnswerTransfer: false,
                  allowFinishTransfer: false,
                  allowTransfer: true,
                  allowAttendedTransfer: true,
                  inConference: false,
                  callInfo: 'Ready',
                  transferControl: false,
                  transferNumber: '',
                }
              : a
          ),
        }))
        //text = localStatePhone.displayCalls[activeChannelNumber].callNumber + " " + localStatePhone.displayCalls[activeChannelNumber].duration

        break
      case 'callAccepted':
        // Established conection
        // Set caller number for Display calls
        let displayCallId = data.customPayload
        let acceptedCall = localStatePhone.phoneCalls.filter(
          (item) => item.sessionId === payload
        )

        if (!acceptedCall[0]) {
          acceptedCall = localStatePhone.displayCalls.filter(
            (item) => item.sessionId === payload
          )
          displayCallId = acceptedCall[0].id
        }

        // Call is Established
        // Lets make a copy of localStatePhone Object
        const newAcceptedLocalStatePhone = _.cloneDeep(localStatePhone)
        // Lets check and delete the call from  phone calls list
        const newAcceptedPhoneCalls = newAcceptedLocalStatePhone.phoneCalls.filter(
          (item) => item.sessionId !== payload
        )
        // Save to the local state
        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: newAcceptedPhoneCalls,
          displayCalls: _.map(localStatePhone.displayCalls, (a) =>
            a.id === displayCallId
              ? {
                  ...a,
                  callNumber: acceptedCall[0].callNumber,
                  displayName: acceptedCall[0].displayName,
                  sessionId: payload,
                  duration: 0,
                  direction: acceptedCall[0].direction,
                  inCall: true,
                  inAnswer: true,
                  hold: false,
                  callInfo: 'Answer',
                }
              : a
          ),
        }))

        break
      case 'hold':
        // let holdCall = localStatePhone.displayCalls.filter((item) => item.sessionId === payload);

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) =>
            a.sessionId === payload
              ? {
                  ...a,
                  hold: true,
                }
              : a
          ),
        }))
        break
      case 'unhold':
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) =>
            a.sessionId === payload
              ? {
                  ...a,
                  hold: false,
                }
              : a
          ),
        }))
        break
      case 'unmute':
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) =>
            a.sessionId === payload
              ? {
                  ...a,
                  muted: 0,
                }
              : a
          ),
        }))
        break
      case 'mute':
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) =>
            a.sessionId === payload
              ? {
                  ...a,
                  muted: 1,
                }
              : a
          ),
        }))
        break
      case 'notify':
        notify(payload)
        break
      default:
        break
    }
  }

  const handleSettingsSlider = (name, newValue) => {
    // setLocalStatePhone((prevState) => ({
    //   ...prevState,
    //   [name]: newValue
    // }));

    switch (name) {
      case 'ringVolume':
        ringer.current.volume = parseInt(newValue, 10) / 100
        setRingVolume(newValue)
        // flowRoute.setOutputVolume(newValue);
        break

      case 'callVolume':
        player.current.volume = parseInt(newValue, 10) / 100
        setCallVolume(newValue)

        break

      default:
        break
    }
  }

  const handleConnectPhone = (event, connectionStatus) => {
    try {
      event.persist()
    } catch (e) {}
    setLocalStatePhone((prevState) => ({
      ...prevState,
      connectingPhone: true,
    }))
    if (connectionStatus === true) {
      flowRoute.start()
    } else {
      flowRoute.stop()
    }

    return true
  }

  const toggleDrawer = (openDrawer) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    drawerSetOpen(openDrawer)
  }
  const handleDialStateChange = (event) => {
    event.persist()
    setdialState(event.target.value)
  }

  const handleConnectOnStart = (event, newValue) => {
    event.persist()
    setLocalStatePhone((prevState) => ({
      ...prevState,
      phoneConnectOnStart: newValue,
    }))

    setConnectOnStartToLocalStorage(newValue)
  }

  const handleNotifications = (event, newValue) => {
    //event.persist();
    if (newValue) {
      setLocalStatePhone((prevState) => ({
        ...prevState,
        notifications: newValue,
      }))
      setNotificationState(newValue)
    } else {
      setNotificationState()
    }
  }

  const handlePressKey = (event) => {
    //event.persist();
    //console.log(event)
    /*console.log(event.currentTarget.value)
      setdialState(dialState + event.currentTarget.value);*/
    setdialState(dialState + event)
    if (flowRoute.activeCall) {
      //console.log('sendDTMF')
      flowRoute.activeCall.sendDTMF(`${event}`)
    }
  }

  const handleCall = (number = '', event) => {
    //event.preventDefault();
    /*AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();*/
    //event.persist();

    //console.log(number)
    //console.log(event.target);
    //console.log(event.target.value);
    if (number.length > 0) {
      setdialState(number)
      if (number.match(/^[0-9]+$/) != null) {
        console.log('Start Call of number' + number)
        flowRoute.call(number.toString())
      }
    }
    //console.log('Click Call:' + dialState)
    //event.persist();
    if (dialState.match(/^[0-9]+$/) != null) {
      console.log('Start Call of dialState', dialState)
      flowRoute.call(dialState.toString())
    }
  }

  const handleEndCall = (event) => {
    //event.persist();
    //flowRoute.hungup(event.currentTarget.value);
    console.log('activeChannelNumber', activeChannelNumber)
    console.log(
      'sessionId',
      localStatePhone.displayCalls[activeChannelNumber].sessionId
    )

    //Meteor.call('siphistory.insert', "22222222");
    flowRoute.hungup(
      localStatePhone.displayCalls[activeChannelNumber].sessionId
    )
    const nexActiveLine = localStatePhone.displayCalls.filter(
      (item) => item.inCall === true
    )
    if (nexActiveLine.length > 0) {
      setActiveChannel(nexActiveLine[0].id)
      flowRoute.activeChannel =
        localStatePhone.displayCalls[nexActiveLine[0].id]
    }
  }

  const handleHold = (sessionId) => {
    //console.log(flowRoute.activeChannel)
    // console.log('Click Hold', flowRoute.activeChannel)
    // const { hold, sessionId } = flowRoute.activeChannel
    console.log('Click Hold sessionId', sessionId)
    const holdLine = localStatePhone.displayCalls.filter(
      (item) => item.sessionId === sessionId
    )
    if (holdLine.length > 0) {
      const { hold, sessionId } = holdLine[0]
      if (hold === false) {
        flowRoute.hold(sessionId)
      } else if (hold === true) {
        flowRoute.unhold(sessionId)
      }
    }
  }

  const handleAnswer = (sessionId) => {
    //event.persist();
    console.log('hendleAnsver sessionID: ', sessionId)
    if (localStatePhone.displayCalls[activeChannelNumber].inCall === false) {
      flowRoute.answer(sessionId)
    } else {
      const freeLine = localStatePhone.displayCalls.filter(
        (item) => item.inCall === false
      )
      if (freeLine.length > 0) {
        const newActiveCall = freeLine[0].id

        if (localStatePhone.displayCalls[activeChannelNumber].hold === false) {
          flowRoute.hold(
            localStatePhone.displayCalls[activeChannelNumber].sessionId
          )
        }

        //console.log('--------newActiveCall')
        //console.log(newActiveCall)
        setActiveChannel(newActiveCall)
        //console.log('---------activeChannelNumber')
        //console.log(activeChannelNumber)
        flowRoute.activeChannel = localStatePhone.displayCalls[newActiveCall]
        flowRoute.answer(sessionId)
      } else {
        notify('Все линии заняты')
      }
    }
  }

  const handleAnswerActiveCall = (sessionId) => {
    flowRoute.answer(sessionId)
  }

  const handleReject = (sessionId) => {
    flowRoute.hungup(sessionId)
  }
  const handleMicMute = () => {
    flowRoute.setMicMuted()
  }
  const handleCallTransfer = () => {
    console.log('handleCallTransfer')
    if (dialState) {
      const newCallTransferDisplayCalls = _.map(
        localStatePhone.displayCalls,
        (a) =>
          a.id === activeChannelNumber
            ? {
                ...a,
                transferNumber: dialState,
                inTransfer: true,
                allowAttendedTransfer: false,
                allowFinishTransfer: false,
                allowTransfer: false,
                callInfo: 'Transfering...',
              }
            : a
      )
      setLocalStatePhone((prevState) => ({
        ...prevState,
        displayCalls: newCallTransferDisplayCalls,
      }))
      //console.log('newCallTransferDisplayCalls')
      //console.log(newCallTransferDisplayCalls)
      flowRoute.activeCall.refer(dialState)
      flowRoute.activeCall.sendDTMF(`##${dialState}`)
    } else {
      notify('Введите номер для переадресации')
    }
  }

  const handleCallAttendedTransfer = (event) => {
    console.log('handleCallAttendedTransfer')
    console.log(event)
    switch (event) {
      case 'transfer':
        const transferCall = localStatePhone.displayCalls[activeChannelNumber]
        if (transferCall.hold === false) {
          // handleHold(
          //   localStatePhone.displayCalls[activeChannelNumber].sessionId
          // )
          flowRoute.hold(transferCall.sessionId)
        }

        const freeLine = localStatePhone.displayCalls.filter(
          (item) => item.inCall === false
        )
        if (freeLine.length > 0) {
          const newActiveCall = freeLine[0].id
          //transferLine = flowRoute.activeChannel
          const newCallAttendedTransferDisplayCalls = _.map(
            localStatePhone.displayCalls,
            (a) => {
              if (a.id === activeChannelNumber) {
                return {
                  ...a,
                  //transferNumber: dialState,
                  allowAttendedTransfer: true,
                  allowTransfer: true,
                  transferControl: false,
                  allowFinishTransfer: false,
                  callInfo: 'Attended Transfering...',
                  inTransfer: true,
                  hold: true,
                }
              } else if (a.id === newActiveCall) {
                return {
                  ...a,
                  transferNumber: transferCall.callNumber,
                  allowAttendedTransfer: false,
                  allowTransfer: false,
                  transferControl: true,
                  allowFinishTransfer: true,
                  callInfo: 'Attended Transfering...',
                  inTransfer: false,
                }
              }
              return a
            }
          )

          setLocalStatePhone((prevState) => ({
            ...prevState,
            displayCalls: newCallAttendedTransferDisplayCalls,
          }))

          setActiveChannel(newActiveCall)

          flowRoute.activeChannel = localStatePhone.displayCalls[newActiveCall]
        } else {
          notify('Все линии заняты')
        }

        //flowRoute.activeCall.sendDTMF(`*2${dialState}`);

        break
      case 'merge':
        const newCallMergeAttendedTransferDisplayCalls = _.map(
          localStatePhone.displayCalls,
          (a) =>
            a.id === activeChannelNumber
              ? {
                  ...a,
                  callInfo: 'Conference',
                  inConference: true,
                }
              : a
        )
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: newCallMergeAttendedTransferDisplayCalls,
        }))

        flowRoute.activeCall.sendDTMF('*5')
        break
      case 'swap':
        flowRoute.activeCall.sendDTMF('*6')
        break
      case 'finish':
        console.log('Start finishing transfer')

        const lineNumberCallTransfer = localStatePhone.displayCalls.filter(
          (item) => item.inTransfer === true
        )

        if (lineNumberCallTransfer.length > 0) {
          const transferChannel = _.find(flowRoute.holdCallsQueue, {
            id: lineNumberCallTransfer[0].sessionId,
          })

          if (transferChannel) {
            const opt = {
              replaces: transferChannel,
              callNumber: lineNumberCallTransfer[0].callNumber,

              mediaConstraints: {
                audio: true,
              },
            }
            flowRoute.activeCall.refer(transferChannel.id, opt)
          } else {
            notify('Не найдена линия для перевода')
          }
        } else {
          notify('Не найдена линия для перевода')
        }
        //flowRoute.activeCall.sendDTMF('*4');
        break
      case 'cancel':
        console.log('Cancel TRANSFER')

        //Находим линию которую пытались перенаправить и меняем значения
        const newCallCancelAttendedTransferDisplayCalls = _.map(
          localStatePhone.displayCalls,
          (a) => {
            if (a.inTransfer) {
              return {
                ...a,
                transferNumber: dialState,
                allowAttendedTransfer: true,
                allowTransfer: true,
                allowFinishTransfer: false,
                transferControl: false,
                inAnswerTransfer: false,
                callInfo: 'Answer',
                inTransfer: false,
              }
            } else if (a.allowFinishTransfer) {
              return {
                ...a,
                transferNumber: '',
                allowAttendedTransfer: true,
                allowTransfer: true,
                transferControl: false,
                allowFinishTransfer: false,
              }
            }
            return a
          }
        )

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: newCallCancelAttendedTransferDisplayCalls,
        }))
        // flowRoute.hungup(
        //   localStatePhone.displayCalls[activeChannelNumber].sessionId
        // )
        //handleEndCall()
        //flowRoute.activeCall.sendDTMF('*3')
        break
      default:
        break
    }
  }
  const handleSettingsButton = () => {
    flowRoute.tmpEvent()
  }

  useEffect(() => {
    console.log('before mediadevices enumeration')

    navigator.mediaDevices
      .enumerateDevices()
      .then((sourceInfos) => {
        console.log('mediadevices enumeration gets sourceInfos', sourceInfos)
        setlocalMediaDevices(sourceInfos)
      })
      .catch((error) => {
        console.log('error on mediadevices enumeration', error)
      })
  }, [])

  useEffect(() => {
    console.log('Update inputDevices')
    // console.log(calls)
    // console.log(flowRoute.player)

    flowRoute.devicesInputId = inputDevices
  }, [inputDevices])

  useEffect(() => {
    console.log('INIT CONNECTIONS')
    console.log('config: ', config)
    console.log('ipPhone: ', ipPhone)

    flowRoute.config = config
    flowRoute.init()
    flowRoute.devicesInputId = inputDevices

    if (localStatePhone.phoneConnectOnStart) {
      handleConnectPhone(null, true)
    }
    try {
      player.current.defaultMuted = false
      player.current.autoplay = true
      player.current.volume = parseInt(localStatePhone.callVolume, 10) / 100

      player.current.setSinkId(outputDevices)
      //player.current.setSinkId(getDefaultInDevices());
      //console.log('Audio is being played on ' + player.current.sinkId );
      // player.volume = this.outputVolume;
      flowRoute.player = player
      // console.log('flowRoute.player-------')
      // console.log(flowRoute.player)

      ringer.current.src = '/ringing.mp3'
      ringer.current.loop = true
      ringer.current.volume = parseInt(localStatePhone.ringVolume, 10) / 100
      flowRoute.ringer = ringer
    } catch (e) {}
  }, [])

  useEffect(() => {
    console.log('localStatePhone', localStatePhone)
    console.log('displayCalls', localStatePhone.displayCalls)
  }, [localStatePhone])

  const historyCalls = useMemo(() => {
    console.log('useMemo CALLS')
    const history = APIClient.v1.get('sip.getHistory', {})
    history.then((resolve) => {
      setCallsHistory(resolve.history)
    })
  }, [ipPhone])

  return (
    <Fragment>
      <div className="call-queue-box">
        <CallQueue
          calls={localStatePhone.phoneCalls}
          handleAnswer={handleAnswer}
          handleReject={handleReject}
        />

      </div>
      <div className="soft-phone-box">
        <Box display="flex" flexDirection="column" height="100%" tabIndex={0} >
          <NavBar
            connectedPhone={localStatePhone.connectedPhone}
            connectingPhone={localStatePhone.connectingPhone}
            isSettings={isSettings}
            setIsSettings={setIsSettings}
            ipPhone={ipPhone}
            notify={notify}
          />

          {notificationState.open ? (
            <Callout m="x16" type="danger" onClick={handleClose}>
              {notificationState.message}
            </Callout>
          ) : null}
          {isSettings === true ? (
            <SettingsBlock
              localMediaDevices={localMediaDevices}
              audioElement={player.current}
              notify={notify}
              hangleSettings={hangleSettings}
              regname={config.authorization_user}
              isTransfer={config.isTransfer}
              transferNumber={config.transferNumber}

            />
          ) : null}

          <PhoneBlock
            handleCallAttendedTransfer={handleCallAttendedTransfer}
            handleCallTransfer={handleCallTransfer}
            handleMicMute={handleMicMute}
            handleHold={handleHold}
            handleCall={handleCall}
            handleEndCall={handleEndCall}
            handlePressKey={handlePressKey}
            activeChannelNumber={activeChannelNumber}
            activeChannel={localStatePhone.displayCalls[activeChannelNumber]}
            handleSettingsButton={handleSettingsButton}
            dialState={dialState}
            setdialState={setdialState}
            handleDialStateChange={handleDialStateChange}
            setLocalStatePhone={setLocalStatePhone}
            setActiveChannel={setActiveChannel}
            localStatePhone={localStatePhone}
          />
          <Divider />
          <HistoryBlock handleCall={handleCall} callsHistory={callsHistory} />
        </Box>
      </div>
      <Box></Box>
      <div hidden>
        <audio id="audio" preload="auto" ref={player} />
      </div>
      <div hidden>
        <audio preload="auto" ref={ringer} />
      </div>
    </Fragment>
  )
}

SoftPhone.propTypes = {
  callVolume: PropTypes.any,
  ringVolume: PropTypes.any,
  setConnectOnStartToLocalStorage: PropTypes.any,
  setNotifications: PropTypes.any,
  setCallVolume: PropTypes.any,
  setRingVolume: PropTypes.any,
  notifications: PropTypes.any,
  connectOnStart: PropTypes.any,
  config: PropTypes.any,
  timelocale: PropTypes.any,
  activeChannelNumber: PropTypes.any,
  activeChannel: PropTypes.any,
  setActiveChannel: PropTypes.any,
  localStatePhone: PropTypes.any,
  hangleSettings: PropTypes.any,
  dialState: PropTypes.any,
  setdialState: PropTypes.any,
}

export default SoftPhone
