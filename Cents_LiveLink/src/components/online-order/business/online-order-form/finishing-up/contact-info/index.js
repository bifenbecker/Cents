import React from "react";
import {Box, Flex, Image, Text} from "rebass/styled-components";

import {RightChevronIcon, PhoneIcon} from "../../../../../../assets/images";

import {sectionStyles} from "../styles";

const ContactInfo = props => {
  const {customer} = props;

  return (
    <Box>
      <Box {...styles.section.header}>Contact Info</Box>
      <Flex
        {...styles.section.link.wrapper}
        {...styles.section.link.lastWrapper}
        onClick={() => {
          console.log("Handler click here");
        }}
      >
        <Box {...styles.section.link.iconWrapper}>
          <Image src={PhoneIcon} />
        </Box>
        <Flex {...styles.section.link.dataWrapper}>
          <Box {...styles.section.link.data}>
            Phone Number
            <Text {...styles.section.link.dataSubText}>{customer?.phoneNumber}</Text>
          </Box>
          <Image src={RightChevronIcon} {...styles.section.link.rightChevron} />
        </Flex>
      </Flex>
    </Box>
  );
};

const styles = {
  section: sectionStyles,
};

export default ContactInfo;
