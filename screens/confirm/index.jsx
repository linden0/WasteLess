import { useEffect, useState } from "react";
import { Button, Text, View, ScrollView,TouchableNativeFeedback, Pressable, Image, TouchableHighlight, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { colorCode } from "../../util/common";
import { EditGroceryModal, DeleteGroceryModal, AddGroceryModal } from "../home/modals";
import ENV from '../../environment.json';
import Loading from "../loading";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ConfirmGroceries({ navigation }) {
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalLoading, setIsAddModalLoading] = useState(false);
  const [groceries, setGroceries] = useState([]);
  const [selectedGrocery, setSelectedGrocery] = useState({});
  const [editModalShown, setEditModalShown] = useState(false);
  const [deleteModalShown, setDeleteModalShown] = useState(false);
  const [addModalShown, setAddModalShown] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [groceryName, setGroceryName] = useState('');
  const [addGroceryName, setAddGroceryName] = useState('');


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
        grocery.daysLeft = daysLeft;
      }
      return grocery;
    });
    setGroceries(newGroceries);
    setEditModalShown(false);
  }

  async function deleteGrocery() {
    const newGroceries = groceries.filter(grocery => grocery.name !== selectedGrocery.name);
    setGroceries(newGroceries);
    setDeleteModalShown(false);
  }

  async function addGrocery() {
    // new name must not be empty
    if (addGroceryName.trim() === '') {
      Alert.alert('Oops!', 'Grocery name cannot be empty');
      return;
    }
    // new name must be at least 3 characters
    if (addGroceryName.length < 3) {
      Alert.alert('Oops!', 'Grocery name must be at least 3 characters');
      return;
    }
    // new name must not exist in groceries
    const matching = groceries.filter(grocery => grocery.name === addGroceryName);
    if (matching.length > 0) {
      Alert.alert('Oops!', 'Grocery with that name already exists');
      return;
    }
    setIsAddModalLoading(true);
    try {
      const response = await fetch(`${ENV.SERVER_URL}/add-grocery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groceryName: addGroceryName
        })
      })
      const data = await response.json();
      console.log(data);
      if (!data.isFood) {
        Alert.alert('Oops!', 'This doesn\'t seem to be a food item. Please try again');
        setIsAddModalLoading(false);

      } else {
        setGroceries([...groceries, {
          name: addGroceryName,
          daysLeft: data.daysLeft
        }])
        setIsAddModalLoading(false);
        setAddModalShown(false);
      }
      setAddGroceryName('');
    }
    catch (e) {
      console.log(e);
    }
  };


  async function handleEditGrocery(grocery) {
    setSelectedGrocery(grocery);
    setDaysLeft(grocery.daysLeft.toString());
    setGroceryName(grocery.name);
    setEditModalShown(true);
  }

  async function handleDeleteGrocery(grocery) {
    setDeleteModalShown(true);;
    setSelectedGrocery(grocery);
  }

  async function confirmGroceries() {
    try {
      // create a new grocery list with expiration date instead of days left
      let newGroceries = []
      const now = new Date();
      for (let grocery of groceries) {
        const expiration = new Date(now.getTime() + grocery.daysLeft * 24 * 60 * 60 * 1000);
        newGroceries.push({
          name: grocery.name,
          expiration: expiration
        });
      }

      await AsyncStorage.setItem('groceries', JSON.stringify(newGroceries));
      navigation.navigate('Home');
    }
    catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const photo = route.params?.photo;
    console.log('calling');
    uploadPhoto(photo);
  }, []);
  
  async function uploadPhoto(photo) {
    const formData = new FormData();
    formData.append('image', {
      uri: photo.uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
  
    try {
      const response = await fetch(`${ENV.SERVER_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = await response.json();
      console.log(data);
      setIsLoading(false);
      setGroceries(data.groceries);
    }
    catch (e) {
      console.log(e);
    }
  }

  function test() {

  }
  
  if (isLoading) {
    return (
      <Loading />
    )
  }
  
  return (
    <View className="flex-1 justify-start items-center pt-10 pb-8">
      <View className="flex-1 w-full h-screen items-center justify-start absolute z-[-1] bg-slate-200">
        <Image source={require('../../assets/background.png')} className="w-screen" />
      </View>
      <View className="w-full flex-row justify-start px-2 mb-10">
        <MaterialIcons name="arrow-back" size={24} color="black" onPress={() => navigation.goBack()} />
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
      <AddGroceryModal
        open={addModalShown}
        setOpen={setAddModalShown}
        groceryName={addGroceryName}
        setGroceryName={setAddGroceryName}
        addGrocery={addGrocery}
        isLoading={isAddModalLoading}
      />
      <View className="mb-10">
        <Text className="font-bold text-4xl mb-2">Confirm Groceries</Text>
        <Text className="m-auto">Edit the list if items are missing</Text>
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
            onPress={() => setAddModalShown(true)}
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
            <MaterialIcons name="add" size={24} color="white" />
          </Pressable>
      </View>

      <View className="mt-8">
        <TouchableHighlight onPress={() => confirmGroceries()} className="bg-green-500 py-4 px-32 rounded-lg" underlayColor={'green'}>
          <Text className="text-white font-bold">Save</Text>
        </TouchableHighlight>
      </View>
    </View>
  )

}