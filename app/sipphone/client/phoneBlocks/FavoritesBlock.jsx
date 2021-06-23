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
  Icon,
  Scrollable,
  Tile,
} from '@rocket.chat/fuselage'
import moment from 'moment'
import { useFormatDateAndTime } from '../../../../client/hooks/useFormatDateAndTime'

export const FavoritesBlock = () => {

  return (
    <Box display="flex" flexDirection="column">
      <Sidebar.Section.Title>Избранное</Sidebar.Section.Title>
      <Scrollable smooth>
        <Tile padding="none" elevation="0">
                   <Box position="relative" minWidth={350}>
                      <Option>
                      <Option.Content>
                            <Box display="flex" flexDirection="column">
                              <Box>ФИО</Box>
                              <Box>564654654</Box>

                            </Box>
                        </Option.Content>

                      </Option>
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
