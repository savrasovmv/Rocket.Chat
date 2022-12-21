import React, { useState, useEffect, useMemo, useContext } from 'react'
import { Meteor } from 'meteor/meteor'
import { SoftPhone } from './SoftPhone.jsx'
import { useSetting } from '../../../client/contexts/SettingsContext'
import { APIClient } from '../../utils/client'
import { call } from '../../ui-utils/client';

import { WebSocketInterface } from 'jssip'
import { SipProvider, useSipContext, SipContext } from './SipContext'
import { SipPageBlock } from './SipPageBlock'

//console.log('Start STREAMER')

export const SipPage = () => {
  if (!Meteor.userId()) return


  return (
    <SipProvider>
      <SipPageBlock/>
    </SipProvider>
  )
}

export default SipPage




