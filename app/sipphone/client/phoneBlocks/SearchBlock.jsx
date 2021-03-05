import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Modal, Box, Item, Content, Sidebar, Option, Button, Icon } from '@rocket.chat/fuselage';


export const LineSearchBlock = ({name, type, number, handleSearchCall, search, typeNumSearch}) => {
	return (
		number ? (
			!typeNumSearch || ( typeNumSearch && number.includes(search)) ? (
				<Option onClick={(e) => handleSearchCall(number, e)}>
		            <Option.Content> 
		                <Box>{name}</Box>
		            </Option.Content>
		            <Option.Content> 
		                <Box>{type}</Box>
		            </Option.Content>
		            <Option.Content> 
		                <Box><Icon color='success' name='phone'/>{number}</Box>
		            </Option.Content>
		            {/*<Option.Menu>
		                <Button square onClick={(e) => handleSearchCall(number, e)} value={number}>
		                <Icon color='success' name='phone'   size='x20' />
		                </Button>
		            </Option.Menu>*/}
		        </Option>
		        ) : null
			

	      ) : null
        


	)
}



export const SearchBlock = ({users, handleSearchCall, typeNumSearch, search}) => {


	return (
		users.map(({name, ipPhone, telephoneNumber, mobile, homePhone, _id}) => (
                  

            <div key={_id}>
                
              <Box position='relative' maxWidth={600} borderWidth='x1' borderColor='neutral-500' >
                
                		<LineSearchBlock
                  			name={name}
                  			type={"вн.номер"}
                  			number={ipPhone}
                  			handleSearchCall={handleSearchCall}
                  			search={search}
                  			typeNumSearch={typeNumSearch}
                  		/>

                        
                  
                  		<LineSearchBlock
                  			name={name}
                  			type={"моб.1"}
                  			number={mobile}
                  			handleSearchCall={handleSearchCall}
                  			search={search}
                  			typeNumSearch={typeNumSearch}
                  		/>
                        
                  
                  		<LineSearchBlock
                  			name={name}
                  			type={"моб.2"}
                  			number={homePhone}
                  			handleSearchCall={handleSearchCall}
                  			search={search}
                  			typeNumSearch={typeNumSearch}
                  		/>
                  
                  		<LineSearchBlock
                  			name={name}
                  			type={"раб.тел."}
                  			number={telephoneNumber}
                  			handleSearchCall={handleSearchCall}
                  			search={search}
                  			typeNumSearch={typeNumSearch}
                  		/>
                        
              </Box>
            </div>

        ))








	)


}

SearchBlock.propTypes = {
  handleCall: PropTypes.any,
  typeNumSearch: PropTypes.any,
  users: PropTypes.any,
  search: PropTypes.any
  

};


export default SearchBlock;