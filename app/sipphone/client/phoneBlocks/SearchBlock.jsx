import React, { Fragment, useState, useEffect } from 'react'
import { Meteor } from 'meteor/meteor'
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
} from '@rocket.chat/fuselage'

export const LineSearchBlock = ({
  name,
  type,
  number,
  handleSearchCall,
  search,
  typeNumSearch,
}) => {
  return number ? (
    !typeNumSearch || (typeNumSearch && number.includes(search)) ? (
      <Box
        //position="relative"
        display="flex"
        justifyContent="space-between"
        flexDirection="row"
        maxWidth={600}
        minWidth={500}
        onClick={(e) => handleSearchCall(number, e)}
      >
        <Box display="flex">{name} </Box>
        {/* <Box display="flex">{type} </Box> */}
        <Box display="flex">
          <Icon color="success" name="phone" />
          {number} ({type})
        </Box>

        {/* <Option onClick={(e) => handleSearchCall(number, e)}>
          <Option.Content>{name}</Option.Content>
          <Option.Content>{type}</Option.Content>
          <Option.Content>
            <Icon color="success" name="phone" />
            {number}
          </Option.Content> */}
        {/*<Option.Menu>
		                <Button square onClick={(e) => handleSearchCall(number, e)} value={number}>
		                <Icon color='success' name='phone'   size='x20' />
		                </Button>
		            </Option.Menu>*/}
        {/* </Option> */}
      </Box>
    ) : null
  ) : null
}

export const SearchBlock = ({
  users,
  handleSearchCall,
  typeNumSearch,
  search,
}) => {
  return users.map(
    ({ name, ipPhone, telephoneNumber, mobile, homePhone, _id }) => (
      <Fragment key={_id}>
        <LineSearchBlock
          name={name}
          type={'вн.номер'}
          number={ipPhone}
          handleSearchCall={handleSearchCall}
          search={search}
          typeNumSearch={typeNumSearch}
        />

        <LineSearchBlock
          name={name}
          type={'моб.1'}
          number={mobile}
          handleSearchCall={handleSearchCall}
          search={search}
          typeNumSearch={typeNumSearch}
        />

        <LineSearchBlock
          name={name}
          type={'моб.2'}
          number={homePhone}
          handleSearchCall={handleSearchCall}
          search={search}
          typeNumSearch={typeNumSearch}
        />

        <LineSearchBlock
          name={name}
          type={'раб.тел.'}
          number={telephoneNumber}
          handleSearchCall={handleSearchCall}
          search={search}
          typeNumSearch={typeNumSearch}
        />
      </Fragment>
    )
  )
}

SearchBlock.propTypes = {
  handleCall: PropTypes.any,
  typeNumSearch: PropTypes.any,
  users: PropTypes.any,
  search: PropTypes.any,
}

export default SearchBlock
