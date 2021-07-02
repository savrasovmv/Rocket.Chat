import React, { useState, useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import PropTypes from 'prop-types'
import {
  Modal,
  Box,
  Item,
  Content,
  Sidebar,
  Option,
  Button,
  ButtonGroup,
  Icon,
  Scrollable,
  Tile,
  InputBox,
  NumberInput,
  Label
} from '@rocket.chat/fuselage'
import moment from 'moment'
import { useFormatDateAndTime } from '../../../../client/hooks/useFormatDateAndTime'

export const FavoritesBlock = ({favorites, updateFavoritesList, updateHistoryList, handleCall}) => {
  console.log("render FavoritesBlock")
  const [value, setValue] = useState(false)

  const handleEditFavorites = (displayName, number, _id) => {
    setValue(
      {
        displayName: displayName,
        number: number,
        _id: _id
      }
    )

  }

  const handleName = (event) => {
    event.persist()
    setValue((prev) => ({
      ...prev,
      displayName: event.target.value
    }))

  }

  const handleNumber = (event) => {
    event.persist()
    setValue((prev) => ({
      ...prev,
      number: event.target.value
    }))

  }

  const handleSaveFavorites = () => {
    console.log("Сохранить")
    Meteor.call('sipfavorites.update', value._id, value.displayName, value.number)
    setValue(false)
    updateFavoritesList()
    updateHistoryList()
  }

  const handleRemoveFavorites = () => {
    console.log("Удалить")
    Meteor.call('sipfavorites.remove', value._id)
    setValue(false)
    updateFavoritesList()
  }

  const handleCancelFavorites = () => {
    setValue(false)

  }




  return (
    <Box display="flex" flexDirection="column">
      <Sidebar.Section.Title>Избранное</Sidebar.Section.Title>

      {value ? (
        <Box display="flex" flexDirection="column" p="10px">
          <Label mbs="x10" fontSize="x14"> Имя </Label>
          <InputBox defaultValue={value.displayName} onChange={handleName}/>
          <Label mbs="x10" fontSize="x14"> Номер </Label>

          <NumberInput defaultValue={value.number} onChange={handleNumber}/>
          <ButtonGroup align='end' pb="10px">
                  <Button primary

                    onClick={(e) => handleSaveFavorites()}
                  >
                    Сохранить
                  </Button>
                  <Button

                    onClick={(e) => handleCancelFavorites()}
                  >
                    Отмена
                  </Button>

                  <Button square onClick={(e) => handleRemoveFavorites()} >
                    <Icon color="danger" name="trash" size='x24' />
                  </Button>
          </ButtonGroup>

        </Box>

      ) : null}
      <Scrollable smooth>
        <Tile padding="none" elevation="0">
                   <Box position="relative" minWidth={350}>
                   {favorites
                      ? favorites.map(
                          ({ number, displayName, _id }) => (
                              <div key={_id}>
                                  <Option>
                                  <Option.Content>
                                        <Box display="flex"  flexDirection="row"   style={{justifyContent: "space-end"}}>
                                          <Box display="flex" flexDirection="column" flexGrow={1}>
                                            <Box>{displayName}</Box>
                                            <Box color="info">{number}</Box>

                                          </Box>


                                          <Box display="flex" w="80px" style={{justifyContent: "space-end"}}>

                                            <Option.Menu>
                                              <ButtonGroup align='end'>
                                                      <Button
                                                        small square
                                                        onClick={(e) => handleCall(number, displayName, e)}
                                                        value={number}
                                                      >
                                                        <Icon color="success" name="phone" size='x24' />
                                                      </Button>
                                                      <Button
                                                        small square
                                                        onClick={(e) => handleEditFavorites(displayName, number, _id)}
                                                        value={number}
                                                      >
                                                        <Icon color="info" name="edit" size='x24' />
                                                      </Button>
                                              </ButtonGroup>
                                            </Option.Menu>
                                          </Box>

                                      </Box>
                                    </Option.Content>

                                  </Option>
                                  </div>
                          )
                        )
                      : null}
                    </Box>
        </Tile>
      </Scrollable>
    </Box>
  )
}

FavoritesBlock.propTypes = {
  //calls: PropTypes.any,
  //handleLists: PropTypes.any,
}

export default FavoritesBlock
