import { View, FlatList, Alert, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import ProjectItem from '../ProjectItem';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { RootStackParamList } from '../Navigation/types';
import { useQuery ,gql } from '@apollo/client';

const MY_PROJECT=gql`
query myTaskLists{
  myTaskLists {
    id
    title
    createdAt
  }
}
`
interface Project {
  id: string;
  title: string;
  createdAt: string;
}


type ProjectScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProjectScreen'>;

const ProjectScreen = () => {
  const[project,setProject]=useState<Project[]>([])
  const {data,error,loading}=useQuery(MY_PROJECT)
  useEffect(()=>{
    if(error){
      Alert.alert('error fetching project',error.message)
    }
  },[error])
  useEffect(()=>{
    if(data){
      setProject(data.myTaskLists)
    }
  },[data])
  const navigation = useNavigation<ProjectScreenNavigationProp>();

  const onPressProject = (projectId: string) => {
    navigation.navigate('ToDoScreen', { id: projectId });
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
      data={project}
      keyExtractor={(item)=>item.id}
      renderItem={({item})=>
      (<ProjectItem project={item} onPress={()=> onPressProject(item.id) } />) }
      ListEmptyComponent={() => (
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text>No projects available</Text>
        </View>
      )}
      />
    </View>
  );
};

export default ProjectScreen;
