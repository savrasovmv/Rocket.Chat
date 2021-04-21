import React, { useState, Fragment, createRef,useEffect } from 'react'
import { Meteor } from 'meteor/meteor'

const ringerIn = createRef() //элемент для рингтона

// Вид звонка ВЫЗЫВАЕМОГО
export const CallInView = ({answerJitsiMeet, rejectJitsiMeet}) => {



    const handleAnswer= () => {
        ringerIn.current.pause();
        answerJitsiMeet()

    }
    const handleReject= () => {
        ringerIn.current.pause();
        rejectJitsiMeet()
    }

    useEffect(() => {
        console.log('INIT CalledView')

        try {

          ringerIn.current.src = '/ringing.mp3'
          ringerIn.current.loop = true
        } catch (e) {
            console.log(e)
        }
        ringerIn.current.play();
      }, [])

    return (
        <div>
            <div>Входящий вызов</div>
            <button onClick={()=>handleAnswer()}>Принять</button>
            <button onClick={handleReject}>Отмена</button>
            <div hidden>
                <audio preload="auto" ref={ringerIn} />
            </div>
        </div>
    )

}
