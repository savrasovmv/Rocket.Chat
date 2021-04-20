import React, { useState, Fragment, createRef,useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import { streamerJitsiCall } from './../lib/streamer'

const ringer = createRef() //элемент для рингтона


export const JitsiCall = () => {
    console.log("++++++++++++++++++++++++++++++++")
    const [inCall, setInCall] = useState(false)
    const [infoCall, setInfoCall] = useState({
        jitsiUrl: '',
		userId: '',
		roomId: ''
    })
    const steamName = Meteor.userId() + '/JitsiCall'
	streamerJitsiCall.on(steamName, function (value) {
		console.log('JitsiCall of Server: ' + value)
		//const newWindow = window.open(value.jitsi_url, "jitsiRoom");
        setInCall(true)
        setInfoCall({
            jitsiUrl: value.jitsiUrl,
            userId: value.userId,
            roomId: value.roomId
        })
        ringer.current.play();
	})

    const handleAnswer= () => {
        ringer.current.pause();
    }

    const handleReject= () => {
        ringer.current.pause();
    }
    useEffect(() => {
        console.log('INIT CONNECTIONS')

        try {

          ringer.current.src = '/ringing.mp3'
          ringer.current.loop = true
        } catch (e) {
            console.log(e)
        }
      }, [])

    //const newWindow = window.open(`${ (noSsl ? 'http://' : 'https://') + domain }/${ jitsiRoom }${ queryString }`, jitsiRoom);
    return (
            <div>
                {inCall ? (
                        <div>
                            Входящий вызов от {infoCall.userId}
                            <div>{infoCall.jitsiUrl} </div>
                            <div><button onClick={handleAnswer}>Принять</button></div>
                            <div><button onClick={handleReject}>Отклонить</button></div>
                        </div>

                     ) : null
                }
                <div hidden>
                    <audio preload="auto" ref={ringer} />
                </div>
            </div>
    )
}

export default React.memo(JitsiCall)
