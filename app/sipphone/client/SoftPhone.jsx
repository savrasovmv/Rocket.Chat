import React, { useState, useEffect, createRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import CallsFlowControl from './CallsFlowControl';
import { StatusBlock } from './phoneBlocks/StatusBlock';
import { CallQueue } from './phoneBlocks/CallQueue';
import { WebSocketInterface} from 'jssip';
import _ from 'lodash';


const config = {
    domain: 'fs2.fineapple.xyz', // sip-server@your-domain.io
    uri: 'sip:1011@fs2.fineapple.xyz', // sip:sip-user@your-domain.io
    password: 'Gfhjkm12@', //  PASSWORD ,
    ws_servers: 'https://fs2.fineapple.xyz:7443', //ws server
    sockets: new WebSocketInterface('wss://fs2.fineapple.xyz:7443'),
    display_name: '1011',//jssip Display Name
    debug: true, // Turn debug messages on
    stun_servers: ['stun.l.google.com:19302', 'stun4.l.google.com:19302,']


};


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
const flowRoute = new CallsFlowControl();
const player = createRef();  //элемент звука
const ringer = createRef();  //элемент для рингтона
const dialState = '1002';
export const SoftPhone = (  callVolume=80, 
                            ringVolume=80, 
                            setCallVolume=80, 
                            setRingVolume=80, 
                            setConnectOnStartToLocalStorage=true,
                            setNotifications=true,
                            notifications = true, 
                            connectOnStart = true, 
                            timelocale = 'UTC') => {


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
            sessionId: ''
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
            sessionId: ''
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
            sessionId: ''
          }
        ],
        phoneConnectOnStart: connectOnStart,
        notifications,
        phoneCalls: [],
        connectedPhone: false,
        connectingPhone: false,
        activeCalls: [],
        callVolume: 80,
        ringVolume: 80
    
    };
    
    const [drawerOpen, drawerSetOpen] = useState(false);
    const [dialState, setdialState] = useState('');
    const [activeChannel, setActiveChannel] = useState(0);
    const [localStatePhone, setLocalStatePhone] = useState(defaultSoftPhoneState);
    const [notificationState, setNotificationState] = useState({ open: false, message: '' });
    const [calls, setCalls] = useState([]);
    const notify = (message) => {
        setNotificationState((notification) => ({ ...notification, open: true, message }));
    };
    Notification.requestPermission();
    const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }

    setNotificationState((notification) => ({ ...notification, open: false }));
    };
    flowRoute.activeChanel = localStatePhone.displayCalls[activeChannel];
    flowRoute.connectedPhone = localStatePhone.connectedPhone;
    flowRoute.engineEvent = (event, payload) => {
    // Listen Here for Engine "UA jssip" events
        console.log(event);
        switch (event) {
          case 'connecting':
            break;
          case 'connected':
            setLocalStatePhone((prevState) => ({
              ...prevState,
              connectingPhone: false,
              connectedPhone: true
            }));

            break;
          case 'registered':
            break;
          case 'disconnected':
            setLocalStatePhone((prevState) => ({
              ...prevState,
              connectingPhone: false,
              connectedPhone: false
            }));
            break;
          case 'registrationFailed':
            break;

          default:
            break;
        }
    };





    flowRoute.onCallActionConnection = async (type, payload, data) => {
      console.log("onCallActionConnection");
      console.log(type);
      console.log(payload);
      console.log(data);
      console.log("localStatePhone.displayCalls");
      console.log(localStatePhone.displayCalls);
    switch (type) {
      case 'reinvite':
        // looks like its Attended Transfer
        // Success transfer
        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            allowAttendedTransfer: true,
            allowTransfer: true,
            inAnswerTransfer: true,
            inTransfer: true,
            attendedTransferOnline: data.request.headers['P-Asserted-Identity'][0].raw.split(' ')[0]

          } : a))
        }));

        break;
      case 'incomingCall':
        // looks like new call its incoming call
        // Save new object with the Phone data of new incoming call into the array with Phone data
        
        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: [
            ...prevState.phoneCalls,
            {
              callNumber: (payload.remote_identity.display_name !== '') ? `${payload.remote_identity.display_name || ''}` : payload.remote_identity.uri.user,
              sessionId: payload.id,
              ring: false,
              duration: 0,
              direction: payload.direction
            }
          ]
        }));
        if (document.visibilityState !== 'visible' && localStatePhone.notifications) {
          const notification = new Notification('Incoming Call', {
            icon: '/call-icon.png',
            body: `Caller: ${(payload.remote_identity.display_name !== '') ? `${payload.remote_identity.display_name || ''}` : payload.remote_identity.uri.user}`,
          });
          notification.onclick = function () {
            window.parent.focus();
            window.focus(); // just in case, older browsers
            this.close();
          };
        }


        break;
      case 'outgoingCall':
        // looks like new call its outgoing call
        // Create object with the Display data of new outgoing call

        const newProgressLocalStatePhone = _.cloneDeep(localStatePhone);
        newProgressLocalStatePhone.displayCalls[activeChannel] = {
          ...localStatePhone.displayCalls[activeChannel],
          inCall: true,
          hold: false,
          inAnswer: false,
          direction: payload.direction,
          sessionId: payload.id,
          callNumber: payload.remote_identity.uri.user,
          callInfo: 'In out call'
        };
        // Save new object into the array with display calls

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: newProgressLocalStatePhone.displayCalls
        }));
        setdialState('');

        break;
      case 'callEnded':
        // Call is ended, lets delete the call from calling queue
        // Call is ended, lets check and delete the call from  display calls list
        //        const ifExist= _.findIndex(localStatePhone.displayCalls,{sessionId:e.sessionId})
        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: localStatePhone.phoneCalls.filter((item) => item.sessionId !== payload),
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
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
            callInfo: 'Ready'

          } : a))
        }));

        const firstCheck = localStatePhone.phoneCalls.filter((item) => item.sessionId === payload && item.direction === 'incoming');
        const secondCheck = localStatePhone.displayCalls.filter((item) => item.sessionId === payload);
        if (firstCheck.length === 1) {
          setCalls((call) => [{
            status: 'missed',
            sessionId: firstCheck[0].sessionId,
            direction: firstCheck[0].direction,
            number: firstCheck[0].callNumber,
            time: new Date()
          }, ...call]);
        } else if (secondCheck.length === 1) {
          setCalls((call) => [{
            status: secondCheck[0].inAnswer ? 'answered' : 'missed',
            sessionId: secondCheck[0].sessionId,
            direction: secondCheck[0].direction,
            number: secondCheck[0].callNumber,
            time: new Date()
          }, ...call]);
        }
        break;
      case 'callAccepted':
        // Established conection
        // Set caller number for Display calls
        let displayCallId = data.customPayload;
        let acceptedCall = localStatePhone.phoneCalls.filter((item) => item.sessionId === payload);

        if (!acceptedCall[0]) {
          acceptedCall = localStatePhone.displayCalls.filter((item) => item.sessionId === payload);
          displayCallId = acceptedCall[0].id;
        }

        // Call is Established
        // Lets make a copy of localStatePhone Object
        const newAcceptedLocalStatePhone = _.cloneDeep(localStatePhone);
        // Lets check and delete the call from  phone calls list
        const newAcceptedPhoneCalls = newAcceptedLocalStatePhone.phoneCalls.filter((item) => item.sessionId !== payload);
        // Save to the local state
        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneCalls: newAcceptedPhoneCalls,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.id === displayCallId ? {
            ...a,
            callNumber: acceptedCall[0].callNumber,
            sessionId: payload,
            duration: 0,
            direction: acceptedCall[0].direction,
            inCall: true,
            inAnswer: true,
            hold: false,
            callInfo: 'In call'
          } : a))
        }));

        break;
      case 'hold':

        // let holdCall = localStatePhone.displayCalls.filter((item) => item.sessionId === payload);

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            hold: true
          } : a))
        }));
        break;
      case 'unhold':

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            hold: false
          } : a))
        }));
        break;
      case 'unmute':

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            muted: 0
          } : a))
        }));
        break;
      case 'mute':

        setLocalStatePhone((prevState) => ({
          ...prevState,
          displayCalls: _.map(localStatePhone.displayCalls, (a) => (a.sessionId === payload ? {
            ...a,
            muted: 1
          } : a))
        }));
        break;
      case 'notify':
        notify(payload);
        break;
      default:
        break;
    }
  };





    const handleConnectPhone = (event, connectionStatus) => {
        try {
          event.persist();
        } catch (e) {
        }
        setLocalStatePhone((prevState) => ({
          ...prevState,
          connectingPhone: true
        }));
        if (connectionStatus === true) {
          flowRoute.start();
        } else {
          flowRoute.stop();
        }

        return true;
    };

    const handleConnectOnStart = (event, newValue) => {
        event.persist();
        setLocalStatePhone((prevState) => ({
          ...prevState,
          phoneConnectOnStart: newValue
        }));

        setConnectOnStartToLocalStorage(newValue);
    };

/*    const handleNotifications = (event, newValue) => {
        event.persist();
        setLocalStatePhone((prevState) => ({
          ...prevState,
          notifications: newValue
        }));

        setNotifications(newValue);
    };*/




    const handleCall = event => {
        //event.preventDefault();
        /*AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();*/
        console.log("Click Call:"+dialState);
        event.persist();
        if (dialState.match(/^[0-9]+$/) != null) {
            console.log("Start Call");
          flowRoute.call(dialState);
        }
    };

    const handleEndCall = event => {
        event.persist();
        flowRoute.hungup(localStatePhone.displayCalls[activeChannel].sessionId);
    };

    const handleAnswer = (event) => {
        /*navigator.getUserMedia = ( navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia );

    // get audio/video
        navigator.getUserMedia({audio:true, video: false}, function (stream) {
          //display video
          var audio = document.getElementById("audio");
          audio.src = URL.createObjectURL(stream);
          window.localStream = stream;
        }, function (error) { console.log(error); }
        );


        var context = new AudioContext();
        console.log("AudioContext--------");
        console.log(context);*/
        flowRoute.answer(event.currentTarget.value);
    };


    const handleDialStateChange = (event) => {
        event.persist();
        console.log("Click Call111:"+event.target.value);
        setdialState(event.target.value);
      };

    useEffect(() => {
        

        flowRoute.config = config;
        flowRoute.init();
        
        if (localStatePhone.phoneConnectOnStart) {
          handleConnectPhone(null, true);
        }
        try {
          player.current.defaultMuted = false;
          player.current.autoplay = true;
          player.current.volume = parseInt(localStatePhone.callVolume, 10) / 100;
          // player.volume = this.outputVolume;
          flowRoute.player = player;
          console.log("flowRoute.player-------")
          console.log(flowRoute.player)
          ringer.current.src = '/ringing.mp3';
          ringer.current.loop = true;
          ringer.current.volume = parseInt(localStatePhone.ringVolume, 10) / 100;
          flowRoute.ringer = ringer;
        } catch (e) {

        }

   
    },
    []);
  return (
    <div className="siphone">
      

          <h1>Sip Phone</h1>
          <p></p>
          <StatusBlock
              connectedPhone={localStatePhone.connectedPhone}
              connectingPhone={localStatePhone.connectingPhone}
            />
        <input
            type="text"
            placeholder="Type to add new tasks"
            value={dialState}
            onChange={handleDialStateChange}
          />
        <div onClick={handleCall}>Call</div>
        <div onClick={handleEndCall}>EndCall</div>
        {/*<div onClick={handleAnswer} value={localStatePhone.sessionId}>Answer</div>*/}
        <CallQueue
          calls={localStatePhone.phoneCalls}
          handleAnswer={handleAnswer}
          
        />
        <div hidden>
            <audio id="audio" preload="auto" ref={player}/>
        </div>
        <div hidden>
            <audio preload="auto" ref={ringer} />
        </div>

    </div>
  );
};