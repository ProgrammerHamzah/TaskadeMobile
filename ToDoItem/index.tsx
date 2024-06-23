import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import CheckBox from '../CheckBox';
import { useMutation, gql } from '@apollo/client';

const UPDATE_TODO=gql`
mutation updateToDo($id:ID!,$content: String, $isCompleted:Boolean){
  updateToDo(id: $id,content: $content,isCompleted: $isCompleted) {
    id
    content
    isCompleted
    taskList {
      title
      todos {
        id
        content
        isCompleted
      }
    }
  }
}
`

interface ToDoItemProps {
  todo: {
    id: string;
    content: string;
    isCompleted: boolean;
  },
  onSubmit:()=>void
}

const ToDoItem = ({ todo,onSubmit }: ToDoItemProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [content, setContent] = useState('');

  const [updateItem]=useMutation(UPDATE_TODO)
  const input = useRef<TextInput>(null)

  const callUpdateItem=()=>{
    updateItem({
      variables:{
        id:todo.id,
        content,
        isCompleted:isChecked,
      }
    })
  }

  useEffect(() => {
    if (!todo) return;
    setIsChecked(todo.isCompleted);
    setContent(todo.content);
  }, [todo]);
  useEffect(() => {
    input?.current?.focus?.();
  }, [input]);
  
  const onKeyPress=({nativeEvent}: NativeSyntheticEvent<TextInputKeyPressEventData>)=>{
    if(nativeEvent.key==='Backspace'&&content===''){
      console.warn('Delete item')
    }
  }
  return (
    <View style={styles.container}>
      <CheckBox isChecked={isChecked} onPress={() => {
        setIsChecked(!isChecked);
        callUpdateItem();
        }} />
      <TextInput
        ref={input}
        value={content}
        onChangeText={setContent}
        style={styles.textInput}
        multiline
        onEndEditing={callUpdateItem}
        onSubmitEditing={onSubmit}
        blurOnSubmit
        onKeyPress={onKeyPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: 'black', // Change text color as needed
    marginLeft: 12,
  },
});

export default ToDoItem;
