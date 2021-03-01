import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const HistoryBlock = ({   calls,
							  localStatePhone,
							  handleConnectPhone,
							  handleSettingsSlider,
							  handleConnectOnStart,
							  handleNotifications,
							  timelocale }) => {



	const [value, setValue] = useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
    		<div className="flex-row">
    		<div className="flex-column">
    			<div>Журнал</div>
    			{calls.map(({
		              sessionId, direction, number, time, status
		            }) => (

		            	<div key={sessionId}  
		                    style={{
		                      color: status === 'missed' ? 'red' : 'green',
		                      fontSize: '0.675rem',
		                      lineHeight: '20px'
		                    }}
		                  >
		                   {direction} : {number} : {time.toString()} : {status}
		                </div>
		           )
		        )}

    		</div>
    		</div>


    )

}

HistoryBlock.propTypes = {
  calls: PropTypes.any,
  localStatePhone: PropTypes.any,
  handleConnectPhone: PropTypes.any,
  handleSettingsSlider: PropTypes.any,
  handleConnectOnStart: PropTypes.any,
  handleNotifications: PropTypes.any,
  callVolume: PropTypes.any,
  timelocale: PropTypes.any

};


export default HistoryBlock;