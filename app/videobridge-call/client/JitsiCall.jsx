import React, { useState, Fragment, createRef,useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker';
import { streamerJitsiCall, streamName, sendBusy, getStreemerMeet } from './../lib/streamer'
import { CallOutView } from './CallOutView'
import { CallInView } from './CallInView'
import {createMeetURL, getJitsiParam} from './../lib/createMeet'
import { info } from 'toastr'
import { CallInitView } from './CallInitView'
import {
    Modal,
    Box,
    Item,
    Content,
    Sidebar,
    Option,
    Button,
    Icon,
    Label,
    Throbber,
    Tooltip
  } from '@rocket.chat/fuselage'
import { settings } from '../../settings';
import { call } from '../../ui-utils/client';
import moment from 'moment';

//import {JitsiMeetExternalAPI as JM, JitsiMeetJS} from './../lib/external_api'

import { Users, Rooms } from '../../models';
import { MessageTypes } from '../../ui-utils';
import * as CONSTANTS from '../constants';
import { TimeSync } from 'meteor/mizzao:timesync';




var openWindows = {}
var timer = {}
var closeInterval = {}
var jitsiApi = {}

var intervalHandler = {} //Интервал для обновления таймаута конференции
var waitingInterval = {} //Интервал для обновления состояния идущей конференции

let timeOutInit = 10000
let timeOutCall = 50000
let timeOutNotifi = 3000
let showAllMessage = false
let showDebug = false




const debug = (text='', value='') => {
    if (showDebug) {
        console.log(text, value)
    }
}

Meteor.startup(() => {
	Tracker.autorun(() => {
		const user = Meteor.user();
		if (!user) {
			return;
		}
        timeOutInit = settings.get('JitsiCall_timeOutInit') || timeOutInit
        timeOutCall = settings.get('JitsiCall_timeOutCall') || timeOutCall
        timeOutNotifi = settings.get('JitsiCall_timeOutNotifi') || timeOutNotifi
        showDebug = settings.get('JitsiCall_Show_Debug') || showDebug
        debug('timeOutInit', timeOutInit)
        debug('timeOutCall', timeOutCall)
        debug('timeOutNotifi', timeOutNotifi)
        debug('showAllMessage', showAllMessage)
        debug('showDebug', showDebug)
	});
});


// export const importJitsiApi = (): Promise<void> => new Promise(async (resolve) => {
//     if(window.JitsiMeetExternalAPI) {
//         resolve(window.JitsiMeetExternalAPI)
//     } else {
//         const head = document.getElementsByTagName("head")[0];
//         const script = document.createElement("script");

//         script.setAttribute("type", "text/javascript");
//         script.setAttribute("src", "https://meet.tmenergo.ru/external_api.js");

//         head.addEventListener("load", function(event: any) {
//             if (event.target.nodeName === "SCRIPT") {
//                 resolve(window.JitsiMeetExternalAPI)
//             }
//         }, true);

//         head.appendChild(script);
//     }
// })


export const JitsiCall = () => {
    const [meetInfo, setMeetInfo] = useState([])
    const [response, setResponse] = useState()
    const [signal, setSignal] = useState()
    const [isConnect, setIsConnect] = useState(false) //подключен к конференции
    const [isShowChat, setIsShowChat] = useState(false) //виден ли чат RC

    const [loading, setLoading] = useState(true);
    const [jitsiMembers, setJitsiMembers] = useState([]);
    //const [timeOutInit, setTimeOutInit] = useState(5000)
    //const [timeOutCall, setTimeOutCall] = useState(60000)
    // const [timeOutNotifi, setTimeOutNotifi] = useState(3000)
    // const [showAllMessage, setShowAllMessage] = useState(false) //Показывать все сообщения о статусе разговора
    //const [showDebug, setShowDebug] = useState(true) //Показывать логи

    const htmlJistsiBox = document.getElementsByClassName('jitsicall-box')[0]

    const userID = Meteor.userId()

    useEffect(() => {
        //debug('JitsiCall Tracker.autorun')
        getStreemerMeet(setResponse)
        // streamerJitsiCall.on(userID + '/' + streamName, function (value) {
        //     debug('streamerJitsiCall LOADED')
        //     if (!value.type) {
        //         return
        //     }
        //     setResponse(value)
        // })
        htmlJistsiBox.style.position = 'absolute'

    }, [])
    

    const addJitsiMembers = (value) => {
        setJitsiMembers((prevState) => ([...prevState, value]))

    }


    const showJitsiCallBox = (value=false) => {
        if (value) {
            value = 'inline-block'
        } else {
            value = 'none'
        }
        htmlJistsiBox.style.display = value

    }

    const getTimeMeet = (dateStart) => {
        var end = moment(new Date()); //todays date
        var start = moment(dateStart); // another date
        var duration = moment.duration(end.diff(start));
        var hour = Math.floor(duration.hours());
        var minut = Math.floor(duration.minutes());
        var sec = Math.floor(duration.seconds());
        var time = " "
        time += hour>0 ? hour + " ч, " : ""
        time += minut>0 ? minut + " мин, " : ""
        time += sec>0 ? sec + " с" : ""
        //+ hour + " ч, " + minut + " мин, " + sec + " с"
        return time
    }



    const deleteMeet = (roomId) => {
        debug('deleteMeet roomId', roomId)
        if (jitsiApi[roomId]) {
            jitsiApi[roomId].dispose();
        }
        const res = meetInfo.find((item) => item.roomId === roomId)
        //console.log('res', res)
        //Если это инициатор, сбрасываем таймаут конференции
        if (res && res.initUserId === userID) {
            debug('jitsi:deleteTimeout', roomId)
            clearInterval(intervalHandler[roomId])
            let time = ""
            let text = ""
            if (res.dateStart) {
                time = getTimeMeet(res.dateStart)
                text = "Звонок"
            } else {
                text = "NotAnswer"
            }
            if (res.status === 'reject') {
                text = 'Звонок отклонен'
            }
            call('jitsi:deleteTimeout', {roomId: roomId, text: text, time: time});
        }
        clearInterval(waitingInterval[roomId])
        setMeetInfo(meetInfo.filter((item) => item.roomId !== roomId ))

        setJitsiMembers([])

    }

    const setStatusMeetInfo = (value) => {
        debug('setStatusMeetInfo ', value)
        if (value.roomId && value.status && value.dateStart) {
            setMeetInfo(_.map(meetInfo, (item) =>
                item.roomId === value.roomId ? {
                    ...item,
                    status: value.status,
                    dateStart: value.dateStart,
                } : item
            ))
            return
        }
        if (value.roomId && value.status) {
            setMeetInfo(_.map(meetInfo, (item) =>
                item.roomId === value.roomId ? {
                    ...item,
                    status: value.status
                } : item
            ))
            return
        }


    }

    const setStatusMeet = (value) => {
        debug('setStatusMeet ', value)
        debug('prev meetInfo ', meetInfo)

        const res = meetInfo.find((item) => item.roomId === value.roomId)
        debug('res meetInfo ', res)
        if (res) {
            if (value.status === res.status) {
                debug('Такой статус уже установлен')
                return
            }

            if (value.status === 'reject') {
                setStatusMeetInfo(value)
                setTimeout(() => {
                    deleteMeet(value.roomId)
                }, [timeOutNotifi])
                return
            }

            //Проверка таймаута звонка, отключаем вызов
            if (value.status === 'checkCall' && (res.status === 'inCall' || res.status === 'outCall')) {
                if (res.initUserId === userID) {

                    setStatusMeetInfo({roomId: value.roomId, status: 'notAnswer'})

                    setTimeout(() => {
                        deleteMeet(value.roomId)
                    }, [timeOutNotifi])

                } else {

                    if (res.count > 2) {

                        waitingInterval[value.roomId] = setInterval(() => {

                            const { jitsiTimeout } = Rooms.findOne({ _id: value.roomId }, { fields: { jitsiTimeout: 1 } });
                            const currentTime = new Date().getTime();
                            debug('jitsiTimeout setInterval waiting', jitsiTimeout)

                            if (!jitsiTimeout) {
                                setSignal({roomId: value.roomId, status: 'finishCall'})
                                clearInterval(waitingInterval[value.roomId])
                            }
                            if (jitsiTimeout > currentTime) {
                                setSignal({roomId: value.roomId, status: 'waiting'})
                            }

                        }, [CONSTANTS.HEARTBEAT])


                    } else {
                        deleteMeet(value.roomId)
                    }
                }
                return
            }

            if (value.status === 'answer') {
                if (res.initUserId === userID) {
                    //устанавливаем время начала конференции
                    value.dateStart = new Date()

                }

                setStatusMeetInfo(value)
                clearTimeout(timer[value.roomId])
                return
            }

            if (value.status === 'finishInCall' && res.status === 'inCall') {
                //Ответили на другом устройстве, прекратить вызов
                deleteMeet(value.roomId)
                clearTimeout(timer[value.roomId])
                clearInterval(waitingInterval[value.roomId])
                return
            }

            if (value.status === 'waiting' && res.status === 'inCall') {
                //Вывод сообщения о начале конференции
                setStatusMeetInfo(value)
                return
            }
        }
    }

    const setStatusMeetMembers = (value) => {
        //Установка статуса участнику конференции
        debug('func setStatusMeetMembers')
        setMeetInfo(_.map(meetInfo, (item) =>
            item.roomId === value.roomId ? {
                ...item,
                members: _.map(item.members, (m) =>
                    m.userId === value.membersUserId ? {
                        ...m,
                        status: value.statusUser
                    } : m
                )
            } : item
        ))
    }

    const startJitsiMeet = (roomId, rcSession) => {
        //Перед созданием окна получаем ссылку jitsi
        //document.getElementsByClassName('jitsicall-box')[0].style.display = 'inline-block'

        debug('startJitsiMeet')
        getJitsiParam(roomId, rcSession)
        .then((resolve) => {
            debug('getJitsiParam resolve: ', resolve)
            const {domain, options} = resolve

            try {
                jitsiApi[roomId] = new JitsiMeetExternalAPI(domain, options);
                jitsiApi[roomId].addEventListener('videoConferenceJoined', () => {
                    debug('Api videoConferenceJoined')
                });
                jitsiApi[roomId].addEventListener('participantJoined', (value) => {
                    //При подключении участника
                    debug('Api participantJoined', value)
                    setSignal({roomId: roomId, status: 'answer', participantJoined: value})
                    setSignal({roomId: roomId, status: 'addMembers', value: value})
                });
                jitsiApi[roomId].addEventListener('participantLeft', (value) => {
                    //При выходе участника
                    debug('Api participantLeft', value)
                    debug('---------------------------',jitsiApi[roomId].getNumberOfParticipants())
                    if (jitsiApi[roomId].getNumberOfParticipants() === 1){
                        //jitsiApi[roomId].dispose();
                        setSignal({roomId: roomId, status: 'finishCall'})
                    }
                });
                jitsiApi[roomId].on('readyToClose', () => {
                    debug('****************Api readyToClose')
                    //jitsiApi[roomId].dispose();
                    setSignal({roomId: roomId, status: 'finishCall'})
                });


                // Окно fsmeet сообщения
                window.addEventListener("message", (e) => {
                    var data = e.data;
                    var type = data.type;
                    var body = data.body;
    
                    if(type === "videoConferenceLeft" && body) { 
                        // Conference finish
                      setSignal({roomId: roomId, status: 'finishCall'})
                      return
                    } else if (type === "text-msg" && body) {
                      //Additional functionality ...
                    }
    
                    if(type === "participantJoined" && body) {
                        // Conference finish
                      setSignal({roomId: roomId, status: 'answer', participantJoined: body})
                      setSignal({roomId: roomId, status: 'addMembers', value: body})
                      return
                    }

                    // if(type === "addParticipantByName" && body) {
                    //     // Conference finish
                    //     let id = 'WPi38KypBTDuCQDqZ'
                    //     valueToUser = {
                    //         type: "inCall",
                    //         roomId: false,
                    //         initUserId: userID,
                    //         count: 2,
                    //         rcSession: rcSession,
                    //     }
                    //     streamerJitsiCall.emit(id + '/' + streamName, valueToUser)
                    //     // start(roomId)
                    //   return
                    // }
                  });

            } catch (error) {
                console.error('Failed to load Jitsi API', error);
            }
                
        })
    }


    const start = (roomId) => {
        intervalHandler[roomId] = setInterval(() => {
            if (Meteor.status().connected) {
                debug('update jitsiTimeout')

                return call('jitsi:updateTimeout', roomId, 'update');
            }
        }, [CONSTANTS.HEARTBEAT]);

	};


    const startOutCall = async (value) => {
        debug('startOutCall', value)
        if (!localStorage['JitsiCall_'+value.roomId]) {
            debug('Звонок с другоо клиента')
            return
        }
        const res = meetInfo.find((item) => item.roomId === value.roomId)
        if (!res) {
            value.status = 'outCall'
            setMeetInfo((prevState) => ([...prevState, value]))
            // startJitsiMeet(value.roomId) // Убрал, подключение только после ответа участника
            localStorage.removeItem('JitsiCall_'+value.roomId);
            timer[value.roomId] = setTimeout(() => {
                setSignal({roomId: value.roomId, status: 'checkCall'})
            }, [timeOutCall])

            start(value.roomId)
        }
    }

    const startInCall = (value) => {
        debug('startInCall', value)
        const res = meetInfo.find((item) => item.roomId === value.roomId)
        if (!res) {
            value.status = 'inCall'
            setMeetInfo((prevState) => ([...prevState, value]))
            timer[value.roomId] = setTimeout(() => {
                setSignal({roomId: value.roomId, status: 'checkCall'})
            }, [timeOutCall])
        }
    }

    const connectCall = (value) => {
        //подключение пользователя к идущей конференции
        debug('connectCall', value)
        //Если у пользователя устанавлена переменная, то это с этого клиента было нажание звонка
        if (!localStorage['JitsiCall_'+value.roomId]) {
            debug('Звонок с другоо клиента')
            return
        }
        const res = meetInfo.find((item) => item.roomId === value.roomId)
        if (!res) {
            value.status = 'answer'
            setMeetInfo((prevState) => ([...prevState, value]))
            startJitsiMeet(value.roomId, value.rcSession)
        }
    }


    const cancelInCall = (value) => {
        //Отмена входящего звонка
        debug('cancelInCall', value)
        if (value.roomId) {
            //Удаляем конференцию
            deleteMeet(value.roomId)
            clearTimeout(timer[value.roomId])
        }
    }

    const rejectFromUsers = (value) => {
        //Юзер отклонил входящий звонок
        debug('rejectFromUsers', value)
        const res = meetInfo.find((item) => item.roomId === value.roomId)
        if (!res) {
            return
        }
        if (res.count === 2) {
            //Меняем статус конференции на reject
            setStatusMeet({roomId: value.roomId, status: 'reject'})
        } else {
            //Изменяем статус у участника конференции
            setStatusMeetMembers({
                                    roomId: value.roomId,
                                    membersUserId: value.rejectUserId,
                                    statusUser: 'reject'
                                })
        }
    }


    const answerFromUsers = (value) => {
        //Юзер принял входящий звонок
        debug('answerFromUsers', value)
        const res = meetInfo.find((item) => item.roomId === value.roomId)
        if (!res) {
            return
        }
        if (res.status !== 'answer') {
            //Меняем статус конференции на 'answer'
            setStatusMeet({roomId: value.roomId, status: 'answer'})
            startJitsiMeet(value.roomId, res.rcSession)
        } else {
            //Изменяем статус у участника конференции
            setStatusMeetMembers({
                                    roomId: value.roomId,
                                    membersUserId: value.userId,
                                    statusUser: 'answer'
                                })
        }
    }


    const handleCancel = (roomId) => {
        //Отмена звонка
        debug('handleCancel', roomId)
        const res = meetInfo.find((item) => item.roomId === roomId)
        if (res) {
            valueToServer = {
                type: 'cancel',
                roomId: roomId,
                userId: userID,
                initUserId: userID,
                members: res.members
            }
            streamerJitsiCall.emit(streamName, valueToServer)
        }
        deleteMeet(roomId)
        clearTimeout(timer[roomId])
    }


    const handleReject = (roomId) => {
        //Отклонил звонк
        debug('handleReject', roomId)
        const res = meetInfo.find((item) => item.roomId === roomId)
        if (res) {
            valueToServer = {
                type: 'reject',
                roomId: res.roomId,
                userId: userID,
                initUserId: res.initUserId,
            }
            streamerJitsiCall.emit(streamName, valueToServer)
        }
        deleteMeet(roomId)
        clearTimeout(timer[roomId])
    }


    const handleAnswer = (roomId) => {
        //Прием звонка
        debug('handleAnswer', roomId)
        debug('handleAnswer meetInfo', meetInfo)
        const res = meetInfo.find((item) => item.roomId === roomId)

        if (res) {
            //Ищем идущие конференции, и завершаем их
            const answer = meetInfo.find((item) => item.status === 'answer')
            if (answer) {
                alert('Невозможно принять вызов т.к существует активный звонок. Завершите звонок.')
            } else {
                //Посылаем статус на сервер для прекращания звонк на других устройствах, если запущено несколько клиентов
                valueToServer = {
                    type: 'answer',
                    roomId: res.roomId,
                    userId: userID,
                    initUserId: res.initUserId,
                }
                
                streamerJitsiCall.emit(streamName, valueToServer)
                
                //Устанавливаем статус answer ответившему, чтобы исключить дубликат подключения если открыто два клиента у одного пользователя
                setStatusMeet({roomId: roomId, status: 'answer'})
                startJitsiMeet(roomId, res.rcSession)
            }
        }
    }


    const handleShowRC = () => {
        //Показать окно чатов
        debug('handleShowRC')
        if (isShowChat) {
            htmlJistsiBox.style.position = 'absolute'
            htmlJistsiBox.style["z-index"] = '99999'
            setIsShowChat(false)
        } else {
            htmlJistsiBox.style.position = 'relative'
            htmlJistsiBox.style["z-index"] = '0'
            setIsShowChat(true)
        }
    }



    useEffect(() => {
        debug('response', response)
        if (!response) {
            return
        }
        switch(response.type){
            case 'outCall':
                startOutCall(response)
            break
            case 'inCall':
                startInCall(response)
            break
            case 'cancel':
                cancelInCall(response)
            break
            case 'reject':
                rejectFromUsers(response)
            break
            case 'answer':
                answerFromUsers(response)
            break
            case 'finishInCall':
                setStatusMeet({roomId: response.roomId, status: response.status})
            break
            case 'connect':
                //Подключение к конференции опоздавшего, при повторном нажатии вызова
                connectCall(response)
            break

        }
    },[response])


    useEffect(() => {
        debug('signal', signal)
        if (!signal) {
            return
        }
        debug('signal true')
        switch(signal.status){
            case 'checkCall':
                debug('signal checkCall')
                setStatusMeet({roomId: signal.roomId, status: 'checkCall'})
            break
            case 'answer':
                debug('signal answer')
                setStatusMeet({roomId: signal.roomId, status: 'answer'})
            break
            case 'waiting':
                debug('signal waiting')
                setStatusMeet({roomId: signal.roomId, status: 'waiting'})
            break
            case 'finishCall':
                debug('signal finishCall')
                deleteMeet(signal.roomId)
            break
            case 'addMembers':
                debug('signal addMembers')
                addJitsiMembers(signal.value)
            break
        }
    },[signal])


    useEffect(() => {
        debug('meetInfo ', meetInfo)

        const res = meetInfo.find((item) => item.status === 'answer')
        if (res) {
            setIsConnect(true)
        } else {
            setIsConnect(false)
        }

        if (meetInfo.length > 0) {
            showJitsiCallBox(true)
        } else {
            showJitsiCallBox(false)
            if (isShowChat) {
                handleShowRC()
            }
        }
    },[meetInfo])

    useEffect(() => {
        debug('jitsiMembers ', jitsiMembers)
    },[jitsiMembers])


    return (
            <Fragment>
                    <Box display="flex" flexDirection="row" height='100%' width='100%' bg='default' invisible={!isConnect}>

                        <Box verticalAlign='middle' title='Показать чат'>
                            <Button ghost verticalAlign='middle' p='x0' onClick={handleShowRC}>
                                <Icon name={isShowChat ? 'chevron-right' : 'chevron-left'} size='x48' color='surface'/>
                            </Button>
                        </Box>
                        <Box height='100%' width='100%'>
                            <div className="jitsi-container"/>
                        </Box>
                    </Box>

                    {meetInfo.map((item, key) => {

                        return item.status !== 'answer' && (
                            <Box className='jitsicall-loading' key={key} >
                                {item.status==='start' || item.status==='notInit' || item.status==='errorOpenWindows' ?
                                    (
                                        <CallInitView status={item.status}/>
                                    ): null
                                }
                                {item.status==='outCall' ||  item.status==='notAnswer' ||  item.status==='reject' ?
                                    (
                                        <CallOutView
                                            infoCall={item}
                                            handleCancel={() => handleCancel(item.roomId)}
                                        />
                                    ): null
                                }
                                {item.status==='inCall' || item.status==='waiting' ?
                                    (
                                        <CallInView
                                            infoCall={item}
                                            handleAnswer={() => handleAnswer(item.roomId)}
                                            handleReject={() => handleReject(item.roomId)}
                                            timeOutCall = {timeOutCall}
                                        />
                                    ): null
                                }

                            </Box>
                        )
                    })}
            </Fragment>
    )
}

export default React.memo(JitsiCall)
