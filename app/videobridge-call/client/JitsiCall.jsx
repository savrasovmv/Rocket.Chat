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

// const ringer = createRef() //элемент для рингтона

const userID = Meteor.userId()

export const JitsiCall = () => {
    console.log("JitsiCall render")

    const [isMeet, setIsMeet] = useState(false)
    const [inCall, setInCall] = useState(false)
    const [outCall, setOutCall] = useState(false)
    const [status, setStatus] = useState(false)
    const [membersStatus, setMembersStatus] = useState([])
    const [infoCall, setInfoCall] = useState({
        roomId: '',
		initUserId: '',
		members: [],
        count: 0
    })

    // useEffect(() => {
    //     console.log('INIT CONNECTIONS')

    //     try {

    //       ringer.current.src = '/ringing.mp3'
    //       ringer.current.loop = true
    //     } catch (e) {
    //         console.log(e)
    //     }
    //   }, [])


    useEffect(() => {
         //const steamName = Meteor.userId() + '/JitsiCall'

         // streamerJitsiCall.on(Meteor.userId() + '/JitsiCall', function (value) {
        //     console.log('JitsiCall of Server: ' + JSON.stringify(value))
        //     //const newWindow = window.open(value.jitsi_url, "jitsiRoom");
        //     if (value.caller) {
        //         setOutCall(true)
        //     } else {
        //         setInCall(true)
        //     }

        //     setInfoCall({
        //         userId: value.userId,
        //         roomId: value.roomId
        //     })
        //     document.getElementsByClassName('jitsicall-box')[0].style.display = 'flex'

        // })

        // //const steamAnswerName = Meteor.userId() + '/AnswerJitsiCall'
        // streamerJitsiCall.on(Meteor.userId() + '/AnswerJitsiCall', function (value) {
        //     console.log('AnswerJitsiCall of Server: ' + JSON.stringify(value))
        //     document.getElementsByClassName('jitsicall-box')[0].style.display = 'none'
        //     setIsMeet(true)
        // })

        // streamerJitsiCall.on(Meteor.userId() + '/RejectJitsiCall', function (value) {
        //     console.log('RejectJitsiCall of Server: ' + JSON.stringify(value))
        //     document.getElementsByClassName('jitsicall-box')[0].style.display = 'none'
        //     setInCall(false)
        //     setOutCall(false)
        //     setIsMeet(false)
        // })


        streamerJitsiCall.on(userID + '/' + streamName, function (value) {
            if (!value.type) {
                return
            }
            console.log("CallJitsi ", value)
            switch(value.type) {
                case 'start':
                    //Юзер нажал на вызов, полуает данные о конференции с сервера
                    console.log('CallJitsi START')
                    setInfoCall(value)
                    setStatus('start')
                    break
                case 'ask':
                    //Юзеру прищел запрос на попытку вызова
                    console.log('CallJitsi ASK')
                    //Если юзер свободен, то ответ accepted, иначе busy
                    if (!status) {
                        valueToServer = {
                            type: 'accepted',
                            roomId: value.roomId,
                            userId: userID,
                            initUserId: value.initUserId
                        }
                        streamerJitsiCall.emit(streamName, valueToServer)
                    } else {
                        sendBusy(value)
                    }
                    break
                case 'init':
                    //Инициализация вызова
                    console.log('CallJitsi INIT')
                    //Если юзер свободен, то ответ accepted, иначе busy
                    if (!status) {
                        if (value.initUserId === userID) {
                            //setOutCall(true)
                            setStatus('outCall')
                        } else {
                            //setInCall(true)
                            setStatus('inCall')
                            setInfoCall(value)
                        }
                    } else {
                        sendBusy(value)
                    }
                    break

                case 'cancel':
                    //Отмена вызова
                    setStatus(false)
                    break

                case 'reject':
                    //Отклонил вызов
                    console.log('reject ', value)
                    if (infoCall.count === 2) {
                        setStatus('reject')
                    } else {
                        console.log('Это конференция', infoCall.members)
                        infoCall.members.map((m) => {
                            console.log('m ', m)
                            if (m.userId === value.rejectUserId) {
                                m.status = 'reject'

                                setMembersStatus( [
                                    {
                                        userId: m.userId,
                                        status: 'reject'
                                    }
                                ]
                                )




                            }
                        })
                    }
                    break

                case 'connect':
                    //Соединение
                    setStatus('connect')
                    break

            }

        })



    }, [])



    const openWindowsJitsiMeet = () => {
        // const newWindow = window.open(jitsiUrl, infoCall.roomId);
        // return newWindow.focus();
        createMeetURL(infoCall.roomId)
        .then((resolve) => {
            //setIsMeet(true)
            const newWindow = window.open(resolve, infoCall.roomId);
            if (newWindow) {
                const closeInterval = setInterval(() => {
                    if (newWindow.closed === false) {
                        return;
                    }
                    setIsMeet(false)
                    clearInterval(closeInterval);
                }, 300);
                return newWindow.focus();
            }

        })


    }

    const handleCancel = () => {
        //Отмена звонка
        console.log('handleCancel')
        valueToServer = {
            type: 'cancel',
            roomId: infoCall.roomId,
            userId: userID,
            initUserId: userID,
            members: infoCall.members
        }
        streamerJitsiCall.emit(streamName, valueToServer)

    }

    const handleAnswer = () => {
        //Прием звонка
        console.log('handleAnswer')
        valueToServer = {
            type: 'answer',
            roomId: infoCall.roomId,
            userId: userID,
            initUserId: infoCall.initUserId,
        }
        streamerJitsiCall.emit(streamName, valueToServer)

    }

    const handleReject = () => {
        //Отклонил звонк
        console.log('handleReject')
        valueToServer = {
            type: 'reject',
            roomId: infoCall.roomId,
            userId: userID,
            initUserId: infoCall.initUserId,
        }
        streamerJitsiCall.emit(streamName, valueToServer)
        setStatus(false)

    }

    useEffect(() => {

        if (isMeet) {
            openWindowsJitsiMeet()
        } else {
            setInCall(false)
            setOutCall(false)
        }


    },[isMeet])

    useEffect(() => {

        console.log('membersStatus ', membersStatus)


    },[membersStatus])

    useEffect(() => {
        console.log('status ', status)
        if (status) {
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'inline-block'
        } else {
            setInCall(false)
            setOutCall(false)
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'none'
        }
        if (status === 'outCall') {
            setOutCall(true)
        }
        if (status === 'inCall') {
            setInCall(true)
        }
        if (status === 'reject') {
            setTimeout(() => {
            setStatus(false)
        }, [3000])
        }
        if (status === 'connect') {
            setInCall(false)
            setOutCall(false)
            openWindowsJitsiMeet()

        }



    },[status])

    // const handleReject= () => {
    //     ringer.current.pause();
    // }

    console.log("isMeet", isMeet)

    //const newWindow = window.open(`${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`, jitsiRoom);
    return (
            <Box>
                {status==='start' ? <CallInitView/> : null}
                {inCall ? <CallInView infoCall={infoCall} handleAnswer={handleAnswer} handleReject={handleReject}/>: null }
                {outCall ? <CallOutView status={status} membersStatus={membersStatus} infoCall={infoCall} handleCancel={handleCancel}/>: null }


            </Box>
    )
}

export default React.memo(JitsiCall)
