import React, {useEffect, useState} from 'react';

const call_icon = "/icons/call-icon.svg"
const end_icon = "/icons/end2-icon.svg"

export const SettingsBlock = ({ localMediaDevices, audioElement, notify, hangleSettings }) => {



  
  //const [localMediaDevices, setlocalMediaDevices] = useState(false);
  const [defaultInDevices, setDefaultInDevices] = useState(localStorage.defaultInDevices);
  const [defaultOutDevices, setDefaultOutDevices] = useState(localStorage.defaultOutDevices);
  const [newInDevices, setNewInDevices] = useState();
  const [newOutDevices, setNewOutDevices] = useState();

  const handleInDevices = (event) => {
      //event.persist();
      const newDevicesId = event.currentTarget.value;
      console.log(newDevicesId);
      setDefaultInDevices(newDevicesId);

      

      
  };

  const handleOutDevices = (event) => {
      //event.persist();
      const newDevicesId = event.currentTarget.value;
      console.log(newDevicesId)
      const promise = audioElement.setSinkId(newDevicesId)
  
      promise.then(function(result) {
          console.log('Audio output device sink ID is '+ newDevicesId);
          setDefaultOutDevices(newDevicesId);

       }, function(e) {
          setDefaultOutDevices(defaultOutDevices);
          console.log('Ошибка назначения устройства аудиовыхода');
          console.log(e);
          notify('Ошибка назначения устройства аудиовыхода '+e);
           
       });
      
      
      
  };


  

  const handleSaveSettings = (event) => {
      //event.persist();
      console.log("SAVE")
  
      localStorage.defaultInDevices = defaultInDevices;
      localStorage.defaultOutDevices = defaultOutDevices;
      hangleSettings();
      
      
  };



  

  return (
    <div className="flex-column">

        <div >Настройки</div>
         
        <div>
          
          <table>
          <tbody>
          <tr>
            <td>
              Микрофон:
            </td>
            <td>
              <select value={defaultInDevices} onChange={handleInDevices}>
                  {localMediaDevices !==false ? (

                          localMediaDevices.filter((devices) => devices.kind === 'audioinput').map((devices, key) => (
                      
                             
                                   <option key={key} value={devices.deviceId}>{devices.label}</option>
                             

                          ))  


                    ): null}
              </select>
            
            </td>
          </tr>
          <tr>
            <td>

              Аудиовыход:
            </td>
            <td>
              <select value={defaultOutDevices} onChange={handleOutDevices}>
                  {localMediaDevices !==false ? (

                          localMediaDevices.filter((devices) => devices.kind === 'audiooutput').map((devices, key) => (
                      
                             
                                   <option key={key} value={devices.deviceId}>{devices.label}</option>
                             

                          ))  


                    ): null}
              </select>
            </td>
          </tr>
          </tbody>
          </table>

          <button className="panel-button  panel-button-min" onClick={handleSaveSettings}>
            
              Сохранить
                    
          </button>
        </div>
    </div>
  );
}


export default SettingsBlock;