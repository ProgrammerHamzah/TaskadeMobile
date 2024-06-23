import { View, Text, FlatList, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/types';
import ToDoItem from '../ToDoItem';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_PROJECT=gql`
query getTaskList($id:ID!){
  getTaskList(id: $id) {
    id
    title
    createdAt
    todos {
      id
      content
      isCompleted
    }
  }
}
`

const CREATE_TODO=gql`
mutation createToDo($content: String!, $taskListId: ID!){
  createToDo(content: $content, taskListId: $taskListId) {
    id
    content
    isCompleted
    taskList {
      id
      progress
    }
  }
}
`
interface Todo {
  id: string;
  content: string;
  isCompleted: boolean;
}

interface Project {
  id: string;
  title: string;
  createdAt: string;
  todos: Todo[];
}


interface ToDoScreenProps {
  route: RouteProp<RootStackParamList, 'ToDoScreen'>;
}

const ToDoScreen: React.FC<ToDoScreenProps> = ({ route }) => {
  

  const [project, setProjects] = useState<Project|null>(null);
  const [title,setTitle]=useState('');

  const { id } = route.params;

  const {data,error,loading}=useQuery(GET_PROJECT, {variables:{id} } )

  const [
    createToDo, {data:createToDoData, error:createToDoError }
  ]=useMutation(CREATE_TODO,{
    refetchQueries:[
      {
        query:GET_PROJECT,
        variables:{id}
      }
    ]
  })

  useEffect(()=>{
    if(error){
      console.log(error)
      Alert.alert('Error fetching project',error.message)
    }
  },[error])

  useEffect(()=>{
    if(data){
      setProjects(data.getTaskList)
      setTitle(data.getTaskList.title)
    }
  },[data])

  const createNewItem = (atIndex: number) => {
    createToDo({
      variables:{
        content:'',
        taskListId:id
      }
    })
  };
  if(!project){
    return null
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <View>
        <TextInput value={title} onChangeText={setTitle} placeholder={''} />
        <FlatList
          data={project.todos}
          renderItem={({ item, index }) => (
            <ToDoItem todo={item} onSubmit={() => createNewItem(index + 1)} />
          )}
          style={{ width: '100%' }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ToDoScreen;
