import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { SoftPhone } from './SoftPhone.jsx';

export const SipPage = () => {
   
  return (
    <div className="SipCallButton">
    
        <SoftPhone/>
    </div>
  );
};

export default SipPage;