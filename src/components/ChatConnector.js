import React from 'react';
import { Query, Mutation, useMutation, graphql } from 'react-apollo'
import gql from 'graphql-tag'

const NEW_CHAT = gql`
  mutation NewChat($to: ID!) {
    newChat(to: $to) { 
      fromTo
    }
  }
`

var mutate = (function(newChat,to) {
  var executed = false;
  return function(newChat,to) {
      if (!executed) {
          executed = true;
          newChat({
            variables: { to: to }
          });
      }
  };
})();

function Connector(props) {
  const to = props.toId
  const [newChat] = useMutation(NEW_CHAT);

  mutate(newChat,to);

  return null;
}

export default Connector
