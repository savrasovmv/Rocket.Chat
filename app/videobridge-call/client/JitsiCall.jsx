import React, { useState, Fragment, createRef,useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import { streamerJitsiCall, sendAnswerJitsiCall } from './../lib/streamer'
import { CallOutView } from './CallOutView'
import { CallInView } from './CallInView'
import {createMeetURL} from './../lib/createMeet'
import { info } from 'toastr'

// const ringer = createRef() //элемент для рингтона


export const JitsiCall = () => {
    console.log("JitsiCall render")

    const [isMeet, setIsMeet] = useState(false)
    const [inCall, setInCall] = useState(false)
    const [outCall, setOutCall] = useState(false)
    const [infoCall, setInfoCall] = useState({
        jitsiUrl: '',
		userId: '',
		roomId: ''
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
        streamerJitsiCall.on(Meteor.userId() + '/JitsiCall', function (value) {
            console.log('JitsiCall of Server: ' + JSON.stringify(value))
            //const newWindow = window.open(value.jitsi_url, "jitsiRoom");
            if (value.caller) {
                setOutCall(true)
            } else {
                setInCall(true)
            }

            setInfoCall({
                userId: value.userId,
                roomId: value.roomId
            })
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'flex'

        })

        //const steamAnswerName = Meteor.userId() + '/AnswerJitsiCall'
        streamerJitsiCall.on(Meteor.userId() + '/AnswerJitsiCall', function (value) {
            console.log('AnswerJitsiCall of Server: ' + JSON.stringify(value))
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'none'
            setIsMeet(true)
        })

        streamerJitsiCall.on(Meteor.userId() + '/RejectJitsiCall', function (value) {
            console.log('RejectJitsiCall of Server: ' + JSON.stringify(value))
            document.getElementsByClassName('jitsicall-box')[0].style.display = 'none'
            setInCall(false)
            setOutCall(false)
            setIsMeet(false)
        })



    }, [])


    const answerJitsiMeet= () => {
        sendAnswerJitsiCall(infoCall.userId, infoCall.roomId)
    }

    const rejectJitsiMeet= () => {
        sendRejectJitsiCall(infoCall.userId, infoCall.roomId)
        setInCall(false)
        setOutCall(false)
        setIsMeet(false)

    }



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

    useEffect(() => {

        if (isMeet) {
            openWindowsJitsiMeet()
        } else {
            setInCall(false)
            setOutCall(false)
        }


    },[isMeet])

    // const handleReject= () => {
    //     ringer.current.pause();
    // }

    console.log("isMeet", isMeet)

    //const newWindow = window.open(`${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`, jitsiRoom);
    return (
            <div>
                {inCall ? <CallInView answerJitsiMeet={answerJitsiMeet} rejectJitsiMeet={rejectJitsiMeet}/>: null }
                {outCall ? <CallOutView/>: null }


            </div>
    )
}

export default React.memo(JitsiCall)
