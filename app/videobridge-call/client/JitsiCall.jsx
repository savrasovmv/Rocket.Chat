import React, { useState, Fragment, createRef,useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import { streamerJitsiCall, streamName, sendBusy } from './../lib/streamer'
import { CallOutView } from './CallOutView'
import { CallInView } from './CallInView'
import {createMeetURL} from './../lib/createMeet'
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
    Throbber
  } from '@rocket.chat/fuselage'
  import { settings } from '../../settings';
  import { call } from '../../ui-utils/client';
  import { useFormatDateAndTime } from '../../../client/hooks/useFormatDateAndTime'
  import moment from 'moment';

// const ringer = createRef() //элемент для рингтона

const userID = Meteor.userId()

var openWindows = {}
var timer = {}
var closeInterval = {}

// const timeOutInit = settings.get('JitsiCall_timeOutInit')
// const timeOutCall = settings.get('JitsiCall_timeOutCall')
// const timeOutNotifi = settings.get('JitsiCall_timeOutNotifi')

export const JitsiCall = () => {
    console.log("JitsiCall render")




    const [meetInfo, setMeetInfo] = useState([])
    const [response, setResponse] = useState()
    const [signal, setSignal] = useState()
    const [timeOutInit, setTimeOutInit] = useState(5000)
    const [timeOutCall, setTimeOutCall] = useState(60000)
    const [timeOutNotifi, setTimeOutNotifi] = useState(3000)
    const [showAllMessage, setShowAllMessage] = useState(false) //Показывать все сообщения о статусе разговора

    console.log("JitsiCall timeOutCall", timeOutCall)

    const formatDate = useFormatDateAndTime()


    useEffect(() => {
        streamerJitsiCall.on(userID + '/' + streamName, function (value) {
            if (!value.type) {
                return
            }
            console.log("CallJitsi ", value)
            setResponse(value)
        })
        setTimeOutInit(settings.get('JitsiCall_timeOutInit'))
        setTimeOutCall(settings.get('JitsiCall_timeOutCall'))
        setTimeOutNotifi(settings.get('JitsiCall_timeOutNotifi'))
        setShowAllMessage(settings.get('JitsiCall_Show_AllMessage'))

    }, [])




    const setStatusMeet = (value) => {
        console.log('SetStatus ', value)
        console.log('prev meetInfo ', meetInfo)

        const res = meetInfo.find((item) => item.roomId === value.roomId)

        if (res) {
            if (value.status === res.status) {
                console.log('Такой статус уже установлен')
                return

            }
            //Проверка после таймаута инициализации
            if (value.status === 'checkInit' && res.status === 'start') {
                setMeetInfo(_.map(meetInfo, (item) =>
                    item.roomId === value.roomId ? {
                        ...item,
                        status: 'notInit'

                    } : item
                ))
                setSignal({type: 'notInit', roomId: res.roomId})
                return
            }

            if (value.status === 'outCall' && res.status === 'start') {
                setMeetInfo(_.map(meetInfo, (item) =>
                    item.roomId === value.roomId ? {
                        ...item,
                        status: value.status

                    } : item
                ))
                setSignal({type: 'outCall', roomId: res.roomId})
                return
            }

            if (value.status === 'checkAnswer' && res.status === 'outCall') {
                setMeetInfo(_.map(meetInfo, (item) =>
                    item.roomId === value.roomId ? {
                        ...item,
                        status: 'notAnswer'

                    } : item
                ))
                setSignal({type: 'notAnswer', roomId: res.roomId})
                return
            }

            if (value.status === 'checkAnswer' && res.status === 'inCall') {
                if (res.count === 2) {
                    deleteMeet(value.roomId)
                } else {
                    setMeetInfo(_.map(meetInfo, (item) =>
                        item.roomId === value.roomId ? {
                            ...item,
                            status: 'waiting'  //В ожидании, когда звонок поступил из конференции

                        } : item
                    ))

                }

                return
            }

            if (value.status === 'answer' && res.status === 'inCall') {
                setMeetInfo(_.map(meetInfo, (item) =>
                    item.roomId === value.roomId ? {
                        ...item,
                        status: 'answer'

                    } : item
                ))
                return
            }

            if (value.status === 'reject' && res.status === 'outCall' && res.count === 2) {
                setMeetInfo(_.map(meetInfo, (item) =>
                    item.roomId === value.roomId ? {
                        ...item,
                        status: 'reject',
                        roomId: ''  //обнуляем Id, если вдруг юзер сразу перезвонит, а у нас еще уведомление висит

                    } : item
                ))
                setSignal({type: 'reject', roomId: res.roomId})
                return
            }
            if (value.status === 'connected' || value.status === 'connection') {
                clearTimeout(timer[res.roomId])
                setMeetInfo(_.map(meetInfo, (item) =>
                    item.roomId === value.roomId ? {
                        ...item,
                        status: value.status,
                        date: new Date()

                    } : item
                ))
                return
            }

            //Если возникла ошибка при открытии окна конференции
            if (value.status === 'errorOpenWindows' && res.status !== 'connection'){
                setMeetInfo(_.map(meetInfo, (item) =>
                    item.roomId === value.roomId ? {
                        ...item,
                        status: value.status

                    } : item
                ))
            }
        }

    }

    const setStatusMeetMembers = (value) => {
        //value={roomId, membersUserId, statusUserId}
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

    const startMeet = (value) => {
        value.status = 'start'
        const res = meetInfo.find((item) => item.roomId === value.roomId)
        if (!res) {
            setMeetInfo((prevState) => ([...prevState, value]))
            setSignal({type: 'start', roomId: value.roomId})
        } else {
            alert('Конференция уже открыта')
        }

    }

    const deleteMeet = (roomId) => {
        console.log('deleteMeet roomId', roomId)
        setMeetInfo(meetInfo.filter((item) => item.roomId !== roomId ))

    }

    const askFromUsers = (value) => {
        //Если конференции еще нет, то ответ accepted
        //  если уже идет, то инициатор отправит коннект опоздавшему
        console.log('askFromUsers')
        const res = meetInfo.find((item) => item.roomId === value.roomId)
        console.log('askFromUsers res', res)
        if (res) {
            //подменяем инициатора как опоздавшего
            console.log('Конференция уже идет')
            //Если я инициатор то отправлю подключение опоздавшему, иначе ничего не отвечаем на ask
            if (res.initUserId === userID){
                console.log('askFromUsers SEND TO AfterAnswer')
                valueToServer = {
                    type: 'afterAnswer',
                    roomId: value.roomId,
                    userId: userID,
                    initUserId: res.initUserId,
                    lateUserId: value.initUserId //Опоздвший юзер
                }
                console.log('valueToServer', valueToServer)
                streamerJitsiCall.emit(streamName, valueToServer)
                //Устанавливаем статус для опоздавшего пользователя
                setStatusMeetMembers({
                    roomId: value.roomId,
                    membersUserId: value.initUserId, //Опоздвший юзер
                    statusUser: 'answer'
                })
            }
        } else {
            //Если конференции еще нет то отвечаем что согласны на вызов
            console.log('Если конференции еще нет то отвечаем что согласны на вызов')
            valueToServer = {
                type: 'accepted',
                roomId: value.roomId,
                userId: userID,
                initUserId: value.initUserId,
                count: value.count
            }
            streamerJitsiCall.emit(streamName, valueToServer)
        }
    }


    const initFromUsers = (value) => {
        //Инициализируем вызов
        //Если я инициатор то открываем Исходящий звонок, иначе Входящий вызов
        if (value.initUserId === userID) {
            const res = meetInfo.find((item) => item.roomId === value.roomId)
            if (res) {
                if (res.status === 'start') {
                    setStatusMeet({roomId: value.roomId, status: 'outCall'})
                    if (showAllMessage) {
                        if (Meteor.status().connected) {
                            return call('jitsiCall:sendMessage', value.roomId);
                        }
                    }
                }
            }

        } else {
            const res = meetInfo.find((item) => item.roomId === value.roomId)
            //Если у клиента запущено два клиента исключаем двойной звонок
            if (!res) {
                value.status = 'inCall'
                setMeetInfo((prevState) => ([...prevState, value]))
                setSignal({type: 'inCall', roomId: value.roomId})
            }


        }
    }

    const cancelFromUsers = (value) => {
        //Отмена входящего звонка
        if (value.roomId) {
            //Удаляем конференцию
            deleteMeet(value.roomId)
            clearTimeout(timer[value.roomId])

            //setMeetInfo(meetInfo.filter((item) => item.roomId !== value.roomId))
        }
    }

    const rejectFromUsers = (value) => {
        //Юзер отклонил входящий звонок
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
        //Юзер принял звонок на другом устройстве
        const res = meetInfo.find((item) => item.roomId === value.roomId && item.status === 'inCall')
        if (!res) {
            return
        }
        deleteMeet(value.roomId)
    }

    const openWindowsJitsiMeet = (roomId) => {
        // const newWindow = window.open(jitsiUrl, infoCall.roomId);
        // return newWindow.focus();
        createMeetURL(roomId)
        .then((resolve) => {
            //setIsMeet(true)
            openWindows[roomId] = window.open(resolve, roomId);
            if (openWindows[roomId]) {
                setResponse({type: 'setStatus', roomId: roomId, status: 'connected'})

                closeInterval[roomId] = setInterval(() => {
                    if (typeof openWindows[roomId].closed !== 'undefined') {
                        if (openWindows[roomId].closed === false) {
                            return;
                        }
                    }

                    clearInterval(closeInterval[roomId]);
                    delete closeInterval[roomId]
                    delete openWindows[roomId]
                    value = {
                        type: 'endMeet',
                        roomId: roomId
                    }
                    setResponse(value)
                }, 300);
                return openWindows[roomId].focus();
            } else {
                setResponse({type: 'setStatus', roomId: roomId, status: 'errorOpenWindows'})
            }

        })


    }

    const connectFromUsers = (value) => {
        //Инициализируем подключение к конференции
        if (value.roomId) {
            const res = meetInfo.find((item) => item.roomId === value.roomId)
            if (res) {
                //if (res.status !== 'connection' && res.status !== 'connected') {
                //Для ответившего уже установили статус answer, что бы исключить двойное подключение, если пользователь имеет несколько открытых клиентов

                if (res.status === 'answer' || res.status === 'outCall') {
                    setStatusMeet({roomId: value.roomId, status: 'connection'})
                    openWindowsJitsiMeet(value.roomId)
                }
                if (res.initUserId === userID) {
                    setStatusMeetMembers({
                        roomId: value.roomId,
                        membersUserId: value.answerUserId,
                        statusUser: 'answer'
                    })
                    if (res.count > 2) {
                        if (Meteor.status().connected) {
                            call('jitsiCall:sendMessage', res.roomId, 'jitsi_call_call', {text:'Конференция начата ', time: ''});
                        }

                    }


                }
            }

        }
    }

    const afterConnectFromUsers = (value) => {
        //Инициализируем подключение к конференции опоздавшего
        if (value.roomId) {
            value.status = 'connection'
            //Заменяем стартовую конференцию на идущую
            setMeetInfo(_.map(meetInfo, (item) =>
                item.roomId === value.roomId ? value : item
            ))
            openWindowsJitsiMeet(value.roomId)

        }
    }

    const sendMessageEndMeet = (roomId, dateStart, count=2) => {
        if (roomId && dateStart) {
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
            console.log("Продолжительность конференции", time)
            if (showAllMessage) {
                if (Meteor.status().connected) {
                    call('jitsiCall:sendMessage', roomId, 'jitsi_call_finished', {text:'Вызов завершен', time: time});
                }
            } else {
                if (count > 2) {
                    if (Meteor.status().connected) {
                        call('jitsiCall:sendMessage', roomId, 'jitsi_call_call', {text:'Конференция окончена ', time: time});
                    }
                } else {
                    if (Meteor.status().connected) {
                        call('jitsiCall:sendMessage', roomId, 'jitsi_call_call', {text:'Звонок ', time: time});
                    }
                }

            }

        }

    }

    const endMeet = (roomId) => {
        //Конец конференции
        if (roomId) {
            const res = meetInfo.find((item) => item.roomId === roomId)
            if (res) {
                if (res.initUserId === userID) {
                    sendMessageEndMeet(res.roomId, res.date, res.count)
                }


                if (res.count === 2) {
                    if (res.initUserId === userID && res.members.length>0 ) {
                        streamerJitsiCall.emit(streamName, {type: 'endMeet', roomId: res.roomId, userId: userID, userIdToSendEnd: res.members[0].userId})
                    } else {
                        streamerJitsiCall.emit(streamName, {type: 'endMeet', roomId: res.roomId, userId: userID, userIdToSendEnd: res.initUserId})
                    }

                }

            }
            deleteMeet(roomId)
        }
    }


    const closeWindowsMeet = (roomId) => {
        //Конец конференции
        if (roomId) {
            const res = meetInfo.find((item) => item.roomId === roomId)
            if (res) {
                sendMessageEndMeet(res.roomId, res.date, res.count)
                if (typeof openWindows[roomId] !== 'undefined') {
                    clearInterval(closeInterval[roomId]);
                    try {
                        openWindows[roomId].close()
                    } catch (e) {
                        console.log('Ошибка при попытки закрытия окна', e)
                    }

                }

                deleteMeet(roomId)

            }

        }
    }





    useEffect(() => {

        if (response){
            console.log('response type', response.type)

            switch(response.type){

                case 'start': //Начало создания конференции, сервер вернул инфо об учасниках и т.п
                    startMeet(response)
                break
                case 'ask': //Запрос на начало конференции
                    askFromUsers(response)
                break
                case 'init': //Инициализация вызова
                    initFromUsers(response)
                break
                case 'answer': //Говорит что клиент уже ответил, для параллельных клиентов
                    answerFromUsers(response)
                break
                case 'cancel':
                    cancelFromUsers(response)
                break
                case 'reject':
                    rejectFromUsers(response)
                break
                case 'connect':
                    connectFromUsers(response)
                break
                case 'afterConnect':  //Подключение опоздавшего к уже идущей конференции
                    afterConnectFromUsers(response)
                break
                case 'deleteMeet':
                    deleteMeet(response.roomId)
                break
                case 'endMeet':
                    endMeet(response.roomId)
                break
                case 'closeWindowsMeet':
                    closeWindowsMeet(response.roomId)
                break
                case 'setStatus':
                    setStatusMeet(response)
                break
            }
        }
    }, [response])


    useEffect(() => {

        if (signal){

            console.log('Signal ', signal)

            switch(signal.type){

                case 'start': //Начало создания конференции, сервер вернул инфо об учасниках и т.п
                    timer[signal.roomId] = setTimeout(() => {
                        setSignal({type: 'finishStart', roomId: signal.roomId})
                    }, [timeOutInit])
                break
                case 'finishStart': //Начало создания конференции, сервер вернул инфо об учасниках и т.п
                    setStatusMeet({roomId: signal.roomId, status: 'checkInit'})
                break
                case 'notInit':
                    setTimeout(() => {
                        setSignal({type: 'finishNotInit', roomId: signal.roomId})
                    }, [timeOutNotifi])
                break
                case 'finishNotInit':
                    deleteMeet(signal.roomId)
                break
                case 'outCall': //Задержка исходящива вызова
                    clearTimeout(timer[signal.roomId])
                    timer[signal.roomId] = setTimeout(() => {
                        setSignal({type: 'finishOutCall', roomId: signal.roomId})
                    }, [timeOutCall])
                break
                case 'finishOutCall':
                    setStatusMeet({roomId: signal.roomId, status: 'checkAnswer'})
                break
                case 'notAnswer': //Задержка показа уведомления пользователь не ответил
                    setTimeout(() => {
                        setSignal({type: 'finishNotAnswer', roomId: signal.roomId})
                    }, [timeOutNotifi])
                break
                case 'finishNotAnswer':
                    deleteMeet(signal.roomId)
                    if (Meteor.status().connected) {
                        call('jitsiCall:sendMessage', signal.roomId, 'jitsi_call_notanswer');
                    }
                break
                case 'inCall': //Задержка входящего вызова
                    timer[signal.roomId] = setTimeout(() => {
                        setSignal({type: 'finishInCall', roomId: signal.roomId})
                    }, [timeOutCall])
                break
                case 'finishInCall':
                    setStatusMeet({roomId: signal.roomId, status: 'checkAnswer'})
                break
                case 'reject': //Задержка показа уведомления пользователь отклонил вызов
                    clearTimeout(timer[signal.roomId])
                    setTimeout(() => {
                        setSignal({type: 'finishReject', roomId: signal.roomId})
                    }, [timeOutNotifi])
                break
                case 'finishReject':
                    //deleteMeet(signal.roomId)
                    deleteMeet('')
                break
                case 'deleteTimer':
                    clearTimeout(timer[signal.roomId])
                break
            }
        }
    }, [signal])


    const handleCancel = (roomId) => {
        //Отмена звонка
        console.log('handleCancel')
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
        if (showAllMessage) {
            if (Meteor.status().connected) {
                call('jitsiCall:sendMessage', roomId, 'jitsi_call_canceled');
            }
        } else {
            if (Meteor.status().connected) {
                call('jitsiCall:sendMessage', roomId, 'jitsi_call_notanswer');
            }
        }

    }

    const handleAnswer = (roomId) => {
        //Прием звонка
        //afterAnswer для подключения к уже идущей конференции
        const res = meetInfo.find((item) => item.roomId === roomId)
        console.log('handleAnswer')
        if (res) {
            valueToServer = {
                type: 'answer',
                roomId: res.roomId,
                userId: userID,
                initUserId: res.initUserId,
            }

            streamerJitsiCall.emit(streamName, valueToServer)

            //Устанавливаем статус answer ответившему, чтобы исключить дубликат подключения если открыто два клиента у одного пользователя
            setStatusMeet({roomId: roomId, status: 'answer'})
        }


    }

    const handleReject = (roomId) => {
        //Отклонил звонк
        console.log('handleReject')
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
        if (Meteor.status().connected) {
            call('jitsiCall:sendMessage', roomId, 'jitsi_call_reject');
        }

    }


    useEffect(() => {
        console.log('meetInfo ', meetInfo)
        const res = meetInfo.find((item) => item.status !== 'connected')

        if (res) {
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'inline-block'
        } else {
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'none'
        }

    },[meetInfo])


    return (
            <Box>
                {meetInfo.map((item, key) => {
                    return (
                        <Box key={key}>
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



            </Box>
    )
}

export default React.memo(JitsiCall)
