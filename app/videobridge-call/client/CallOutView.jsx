import React, { useState, Fragment, createRef,useEffect } from 'react'
import { Meteor } from 'meteor/meteor'

const ringer = createRef() //элемент для рингтона

// Вид звонка ЗВОНЯЩЕГО
export const CallOutView = () => {


    const handleReject= () => {
        ringer.current.pause();
    }

    useEffect(() => {
        console.log('INIT CallerView')

        try {

          ringer.current.src = '/callerRington.mp3'
          ringer.current.loop = true
        } catch (e) {
            console.log(e)
        }
        ringer.current.play();
      }, [])

    return (
        <div>
            <div>Вызываю</div>
            <button onClick={handleReject}>Отмена</button>
            <div hidden>
                <audio preload="auto" ref={ringer} />
            </div>
        </div>
    )

}
