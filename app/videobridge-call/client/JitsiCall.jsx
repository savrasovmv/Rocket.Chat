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

// const ringer = createRef() //элемент для рингтона

const userID = Meteor.userId()

var openWindows = {}
var timer = {}

timeOutInit = settings.get('JitsiCall_timeOutInit')
timeOutCall = settings.get('JitsiCall_timeOutCall')
timeOutNotifi = settings.get('JitsiCall_timeOutNotifi')

export const JitsiCall = () => {
    console.log("JitsiCall render")



    const [meetInfo, setMeetInfo] = useState([])
    const [response, setResponse] = useState()
    const [signal, setSignal] = useState()



    // const [isMeet, setIsMeet] = useState([])
    // const [inCall, setInCall] = useState(false)
    // const [outCall, setOutCall] = useState(false)
    // const [status, setStatus] = useState(false)
    // const [membersStatus, setMembersStatus] = useState([])
    // const [infoCall, setInfoCall] = useState({
    //     roomId: '',
	// 	initUserId: '',
	// 	members: [],
    //     count: 0
    // })

    // const setDefaulState = () => {
    //     setInfoCall({
    //         roomId: '',
    //         initUserId: '',
    //         members: [],
    //         count: 0
    //     })
    //    // setIsMeet([])
    //     setInCall(false)
    //     setOutCall(false)
    //     setStatus(false)
    //     setMembersStatus([])
    // }



    useEffect(() => {
        streamerJitsiCall.on(userID + '/' + streamName, function (value) {
            if (!value.type) {
                return
            }
            console.log("CallJitsi ", value)
            setResponse(value)
        })
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
                deleteMeet(value.roomId)
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
                        status: value.status

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

            // if (value.status === 'connection' && res.status === 'outCall') {
            //     setMeetInfo(_.map(meetInfo, (item) =>
            //         item.roomId === value.roomId ? {
            //             ...item,
            //             status: 'connection'

            //         } : item
            //     ))
            //     return
            // }
            // if (value.status === 'connection' && res.status === 'inCall') {
            //     setMeetInfo(_.map(meetInfo, (item) =>
            //         item.roomId === value.roomId ? {
            //             ...item,
            //             status: 'connection'

            //         } : item
            //     ))
            //     return
            // }
            // if (value.status === 'connected' && res.status === 'connection') {
            //     setMeetInfo(_.map(meetInfo, (item) =>
            //         item.roomId === value.roomId ? {
            //             ...item,
            //             status: 'connected'

            //         } : item
            //     ))
            //     setSignal({type: 'deleteTimer', roomId: res.roomId})
            //     return
            // }


            // if (value.status === 'notAnswer' && res.count > 2) {
            //     setMeetInfo(_.map(meetInfo, (item) =>
            //         item.roomId === value.roomId ? {
            //             ...item,
            //             members: _.map(item.members, (m) =>
            //                 m.status === false ? {
            //                     ...m,
            //                     status: 'notAnswer'
            //                 } : m
            //             )
            //         } : item

            //     ))
            //     return
            // }

            // if (value.status === 'outCall' && res.status === 'start') {
            //     setMeetInfo(_.map(meetInfo, (item) =>
            //         item.roomId === value.roomId ? {
            //             ...item,
            //             status: value.status

            //         } : item
            //     ))
            //     setSignal({type: 'outCall', roomId: res.roomId})
            //     return
            // }
            // //Если статус подключение или подключен не позволять изменять статус приходящий по таймауту, типо notAnswer
            // if (res.status !== 'connected' && res.status !== 'connection'){
            //     console.log('Текущий статус', res.status)
            //     console.log('Устанавливаем статус', value.status)
            //     setMeetInfo(_.map(meetInfo, (item) =>
            //         item.roomId === value.roomId ? {
            //             ...item,
            //             status: value.status

            //         } : item
            //     ))
            // }
            // if (value.status === 'connected' && res.status === 'connection'){
            //     console.log('Переключаем статус на подключенный')
            //     setMeetInfo(_.map(meetInfo, (item) =>
            //         item.roomId === value.roomId ? {
            //             ...item,
            //             status: value.status

            //         } : item
            //     ))
            // }
            // //Если возникла ошибка при открытии окна конференции
            // if (value.status === 'errorOpenWindows' && res.status !== 'connection'){
            //     setMeetInfo(_.map(meetInfo, (item) =>
            //         item.roomId === value.roomId ? {
            //             ...item,
            //             status: value.status

            //         } : item
            //     ))
            // }

        }



        // if (value.status === 'notInit') {
        //     setTimeout(() => {
        //         deleteMeet(value.roomId)
        //     }, [timeOutNotifi])

        // }
        // if (value.status === 'reject') {
        //     setTimeout(() => {
        //         deleteMeet(value.roomId)
        //     }, [timeOutNotifi])

        // }
        // if (value.status === 'notAnswer') {
        //     console.log('TimeOut notAnswer Start')
        //     setTimeout(() => {
        //         console.log('TimeOut notAnswer Start 2')
        //         deleteMeet(value.roomId)
        //     }, [timeOutNotifi])
        // }

        // if (value.status === 'outCall') {
        //     console.log('TimeOut OutCall Start')
        //     setTimeout(() => {
        //         console.log('TimeOut OutCall Start 1')
        //         const res = meetInfo.find((item) => item.roomId === value.roomId)
        //         console.log('TimeOut OutCall res', res)
        //         if (res.status === 'outCall') {
        //             console.log('TimeOut OutCall Start 2')
        //             setStatusMeet({roomId: value.roomId, status: 'notAnswer'})
        //         }
        //     }, [timeOutCall])

        // }
        // if (value.status === 'inCall') {
        //     setTimeout(() => {
        //         const res = meetInfo.find((item) => item.roomId === value.roomId)
        //         if (res.status === 'inCall') {
        //             deleteMeet(value.roomId)
        //         }
        //     }, [timeOutCall])

        // }
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
                initUserId: value.initUserId
            }
            streamerJitsiCall.emit(streamName, valueToServer)
        }
    }


    const initFromUsers = (value) => {
        //Инициализируем вызов
        //Если я инициатор то открываем Исходящий звонок, иначе Входящий вызов
        if (value.initUserId === userID) {
            setStatusMeet({roomId: value.roomId, status: 'outCall'})
        } else {
            value.status = 'inCall'
            setMeetInfo((prevState) => ([...prevState, value]))
            setSignal({type: 'inCall', roomId: value.roomId})

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

    const openWindowsJitsiMeet = (roomId) => {
        // const newWindow = window.open(jitsiUrl, infoCall.roomId);
        // return newWindow.focus();
        createMeetURL(roomId)
        .then((resolve) => {
            //setIsMeet(true)
            openWindows[roomId] = window.open(resolve, roomId);
            if (openWindows[roomId]) {
                setResponse({type: 'setStatus', roomId: roomId, status: 'connected'})

                const closeInterval = setInterval(() => {
                    if (typeof openWindows[roomId].closed === 'undefined') {
                        clearInterval(closeInterval);
                    }
                    if (openWindows[roomId].closed === false) {
                        return;
                    }
                    clearInterval(closeInterval);
                    delete openWindows[roomId]
                    value = {
                        type: 'deleteMeet',
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
                if (res.status === 'inCall' || res.status === 'outCall') {
                    setStatusMeet({roomId: value.roomId, status: 'connection'})
                    openWindowsJitsiMeet(value.roomId)
                }
                if (res.initUserId === userID) {
                    setStatusMeetMembers({
                        roomId: value.roomId,
                        membersUserId: value.answerUserId,
                        statusUser: 'answer'
                    })
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





    useEffect(() => {

        if (response){

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

    }



    // const busyFromUsers = (value) => {
    //     if (infoCall.count == 2) {
    //         setStatus('busy')
    //     } else {
    //         console.log('Это групповой вызов', infoCall.members)
    //         console.log("rejectFromUsers infoCall", infoCall)
    //         setInfoCall((prevState) => ({
    //             ...prevState,
    //             members: _.map(infoCall.members, (m) =>
    //                 m.userId === value.rejectUserId
    //                     ? {
    //                         ...m,
    //                         status: 'busy'
    //                     }
    //                      : m
    //             ),

    //         }))

    //     }
    // }







    useEffect(() => {
        console.log('meetInfo ', meetInfo)
        const res = meetInfo.find((item) => item.status !== 'connected')

        if (res) {
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'inline-block'
        } else {
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'none'
        }

        // meetInfo.map((value) => {
        //     if (value.status === 'notInit') {
        //         setTimeout(() => {
        //             deleteMeet(value.roomId)
        //         }, [timeOutNotifi])

        //     }
        //     if (value.status === 'reject') {
        //         setTimeout(() => {
        //             deleteMeet(value.roomId)
        //         }, [timeOutNotifi])

        //     }
        //     if (value.status === 'notAnswer') {
        //         console.log('TimeOut notAnswer Start')
        //         setTimeout(() => {
        //             console.log('TimeOut notAnswer Start 2')
        //             setResponse({type: 'deleteMeet', roomId: value.roomId})
        //             //deleteMeet(value.roomId)
        //         }, [timeOutNotifi])
        //     }

        //     if (value.status === 'outCall') {
        //         console.log('TimeOut OutCall Start')
        //         setTimeout(() => {
        //             console.log('TimeOut OutCall Start 1')
        //             setResponse({type: 'setStatus', roomId: value.roomId, status: 'notAnswer'})
        //         }, [timeOutCall])

        //     }
        //     if (value.status === 'inCall') {
        //         setTimeout(() => {
        //             const res = meetInfo.find((item) => item.roomId === value.roomId)
        //             if (res.status === 'inCall') {
        //                 setResponse({type: 'deleteMeet', roomId: value.roomId})
        //             }
        //         }, [timeOutCall])

        //     }
        // })


    },[meetInfo])

    // useEffect(() => {

    //     console.log('membersStatus ', membersStatus)
    //     if (membersStatus.type === 'reject'){
    //         rejectFromUsers(membersStatus)
    //     }
    //     if (membersStatus.type === 'busy'){
    //         busyFromUsers(membersStatus)
    //     }
    //     if (membersStatus.type === 'init') {
    //         initFromUsers(membersStatus)
    //     }
    //     if (membersStatus.type === 'ask') {
    //         askFromUsers(membersStatus)
    //     }
    //     if (membersStatus.type === 'deleteMeet') {
    //         deleteMeet(membersStatus)
    //     }


    // },[membersStatus])

    // useEffect(() => {

    //     console.log('infoCall ', infoCall)


    // },[infoCall])



    // useEffect(() => {
    //     console.log('status ', status)

    //     if (status) {
    //         document.getElementsByClassName('jitsicall-box')[0].style.display = 'inline-block'
    //     } else {
    //         console.log('infoCall в эфекте при отмене', infoCall)
    //         setDefaulState()
    //         document.getElementsByClassName('jitsicall-box')[0].style.display = 'none'
    //     }
    //     if (status === 'start') {
    //         const startInterval = setInterval(() => {
    //             setStatus('notInit')
    //             clearInterval(startInterval);
    //         }, 10000);
    //     }
    //     if (status === 'notInit') {
    //         setTimeout(() => {
    //             setStatus(false)
    //         }, [3000])


    //     }
    //     if (status === 'notAnswer') {
    //         setTimeout(() => {
    //             if (infoCall.count === 2) {
    //                 setStatus(false)
    //             }
    //         }, [5000])
    //     }
    //     if (status === 'outCall') {
    //         setOutCall(true)
    //         const outCallInterval = setInterval(() => {
    //             console.log('outCall'Interval')
    //             if (status === 'outCall') {
    //                 setStatus('notAnswer')
    //                 clearInterval(outCallInterval);
    //             }
    //         }, 10000);

    //     }
    //     if (status === 'inCall') {
    //         setInCall(true)
    //         const inCallInterval = setInterval(() => {
    //             if (status === 'inCall') {
    //                 setStatus(false)
    //                 clearInterval(inCallInterval);
    //             }
    //         }, 10000);

    //     }
    //     if (status === 'reject') {
    //         setTimeout(() => {
    //             if (infoCall.count === 2) {
    //                 setStatus(false)
    //             }
    //         }, [3000])
    //     }
    //     if (status === 'connect') {
    //         setInCall(false)
    //         setOutCall(false)
    //         openWindowsJitsiMeet()

    //     }
    //     if (status === 'busy') {
    //         setTimeout(() => {
    //             if (infoCall.count === 2) {
    //                 setStatus(false)
    //             }
    //         }, [3000])

    //     }



    // },[status])

    // const handleReject= () => {
    //     ringer.current.pause();
    // }

   // console.log("isMeet", isMeet)

    //const newWindow = window.open(`${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`, jitsiRoom);
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
                            {item.status==='inCall' ?
                                (
                                    <CallInView
                                        infoCall={item}
                                        handleAnswer={() => handleAnswer(item.roomId)}
                                        handleReject={() => handleReject(item.roomId)}
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
