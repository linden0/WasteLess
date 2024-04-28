import { Modal, ScrollView, TextInput, Button, Text, Touchable, TouchableNativeFeedback, View, Keyboard, Alert, Image } from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import {MaterialIcons} from '@expo/vector-icons';
import { Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { DeleteGroceryModal, EditGroceryModal } from './modals';
import { colorCode } from '../../util/common';
import ENV from '../../environment.json'


export default function Home({ navigation }) {
  const isFocused = useIsFocused();

  const [groceries, setGroceries] = useState([])
  const [selectedGrocery, setSelectedGrocery] = useState({});
  const [editModalShown, setEditModalShown] = useState(false);
  const [deleteModalShown, setDeleteModalShown] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [groceryName, setGroceryName] = useState('');

  async function test() {
    await AsyncStorage.clear();
    fetchData();
    return;
    console.log(`${ENV.SERVER_URL}/test`);
    try {
      const response = await fetch(`${ENV.SERVER_URL}/test`);
      const data = await response.json();
      console.log(data);
    }
    catch (e) {
      console.log(e);
    }
  }


  function expirationToDays(expiration) {
    const now = new Date();
    expiration = new Date(expiration);
    let diff = expiration.getTime() - now.getTime();
    diff = Math.max(diff, 0)
    const days = Math.round(diff / (24 * 60 * 60 * 1000));
    return days;
  }

  async function fetchData() {
    try {
      let data = await AsyncStorage.getItem('groceries');
      data = JSON.parse(data);
      // add expiration in days to each grocery
      data = data.map(grocery => {
        grocery.daysLeft = expirationToDays(grocery.expiration);
        return grocery;
      });
      // sort groceries by days left (increasing)
      data.sort((a, b) => a.daysLeft - b.daysLeft);
      setGroceries(data);
    }
    catch (e) {
      console.log(e);
    }
  }

  async function saveEditedGrocery() {
    // new name must not be empty
    if (groceryName.trim() === '') {
      Alert.alert('Oops!', 'Grocery name cannot be empty');
      return;
    }
    // new name must match selectedGrocery name or not exist in groceries
    const matching = groceries.filter(grocery => grocery.name === groceryName);
    if (matching.length > 0 && groceryName !== selectedGrocery.name) {
      Alert.alert('Oops!', 'Grocery with that name already exists');
      return;
    }
    // new expiration date must be a number
    if (isNaN(daysLeft)) {
      Alert.alert('Oops!', 'Days till expiration must be a number');
      return;
    }
    // new expiration date must be positive
    if (daysLeft <= 0) {
      Alert.alert('Oops!', 'Days till expiration must be a number greater than 0');
      return;
    }
    // update the grocery
    const newGroceries = groceries.map(grocery => {
      if (grocery.name === selectedGrocery.name) {
        grocery.name = groceryName;
        grocery.expiration = new Date(new Date().getTime() + daysLeft * 24 * 60 * 60 * 1000);
      }
      return grocery;
    });
    try {
      await AsyncStorage.setItem('groceries', JSON.stringify(newGroceries));
      setEditModalShown(false);
      fetchData();
    }
    catch (e) {
      console.log(e);
    }
  }

  async function deleteGrocery() {
    const newGroceries = groceries.filter(grocery => grocery.name !== selectedGrocery.name);
    try {
      await AsyncStorage.setItem('groceries', JSON.stringify(newGroceries));
      setDeleteModalShown(false);
      fetchData();
    }
    catch (e) {
      console.log(e);
    }
  }

  async function handleEditGrocery(grocery) {
    setSelectedGrocery(grocery);
    setDaysLeft(expirationToDays(grocery.expiration).toString());
    setGroceryName(grocery.name);
    setEditModalShown(true);
  }

  async function handleDeleteGrocery(grocery) {
    setDeleteModalShown(true);;
    setSelectedGrocery(grocery);
  }

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  return (
    <View className="flex-1 justify-start items-center pt-16 pb-8">
      <View className="flex-1 w-full h-screen items-center justify-start absolute z-[-1] bg-slate-200">
        <Image source={require('../../assets/background.png')} className="w-screen" />
      </View>
      <EditGroceryModal 
        open={editModalShown}
        setOpen={setEditModalShown}
        groceryName={groceryName}
        setGroceryName={setGroceryName}
        daysLeft={daysLeft}
        setDaysLeft={setDaysLeft}
        saveEditedGrocery={saveEditedGrocery}
      />
      <DeleteGroceryModal
        open={deleteModalShown}
        setOpen={setDeleteModalShown}
        deleteGrocery={deleteGrocery}
      />
      <View>
        <Text className="font-bold text-4xl mb-10">Wasteless</Text>
      </View>

      <View className="flex-row w-full mb-2 px-6">
        <Text className="w-1/4 font-bold text-left">Item</Text>
        <Text className="w-1/3 font-bold text-right">Days Till Expire</Text>
      </View>

      <View className="w-full px-4">
        <View style={{maxHeight: 300, height: 300, borderRadius: 20}} className="bg-white w-full rounded-lg">
          <ScrollView style={{flexGrow: 0}}>
            {
              groceries.map((item, index) => (
                <View key={index} className={`flex-row w-full items-center px-2 border-gray-300 py-2 border-b-2`}>
                  <Text className="w-1/4 text-left">{item.name}</Text>
                  <View className="w-1/3 flex-row justify-center">
                    <View style={{backgroundColor: colorCode(item.daysLeft)[1]}} className={`w-fit self-start px-2 py-0.5 rounded-lg overflow-hidden`}>
                      <Text style={{color: colorCode(item.daysLeft)[0]}} className={`text-right`}>{item.daysLeft}</Text>
                    </View>
                  </View>
                  <View className="flex-1 flex-row justify-center">
                    <TouchableNativeFeedback onPress={() => handleEditGrocery(item) }>
                      <MaterialIcons name="edit" size={24} color="black"/>
                    </TouchableNativeFeedback>
                    <View className="w-1/5"></View>
                    <TouchableNativeFeedback onPress={() => handleDeleteGrocery(item)}>
                      <MaterialIcons name="delete" size={24} color="black"/>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              ))
            }
            {
              groceries.length === 0 &&
              <View className="flex-1 justify-center items-center mt-28">
                <Text className="text-center">No groceries added yet</Text>
              </View>
            }
          </ScrollView>

        </View>
      </View>
         
      <View className="mt-8">
          <Pressable
            onPress={() => navigation.navigate("Camera")}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? 
                  'rgba(0, 0, 0, 0.5)'
                  : 'rgba(0, 0, 0, 1)',
                borderRadius: "9999px",
                width: 50,
                height:50,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            >
            <MaterialIcons name="camera-alt" size={24} color="white" />
          </Pressable>
      </View>
      <Button onPress={test} title='Test'/>

    </View>
  );
}

