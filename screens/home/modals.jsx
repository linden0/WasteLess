import { ActivityIndicator, Keyboard, TouchableHighlight } from "react-native";
import { Modal, Pressable, Text, View, TextInput, Button } from "react-native";
import React from "react";

export function DeleteGroceryModal({ open, setOpen, deleteGrocery}) {
  if (!open) return null;
  return (
    <Modal
      transparent={true}
      animationType='fade'
    >
      <Pressable 
        className="flex-1 justify-center items-center w-full" 
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} 
        onPress={() => {
          setOpen(false);
        }}
      >
        <View className="bg-white w-3/4 py-4 px-8 rounded-xl space-y-4">
          <Text className="font-bold text-2xl mx-auto">Are you sure?</Text>
          <View className="flex-row justify-center space-x-4">
            <TouchableHighlight onPress={() => { Keyboard.dismiss(); deleteGrocery(); }}>
              <View className="bg-red-500 px-4 py-2 rounded-lg">
                <Text className="text-white">Yes</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => { Keyboard.dismiss(); setOpen(false) }} className="rounded-lg">
              <View className="bg-gray-200 px-4 py-2 rounded-lg">
                <Text className="">No</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Pressable>
    </Modal>
  )
}

export function EditGroceryModal({ open, setOpen, groceryName, setGroceryName, daysLeft, setDaysLeft, saveEditedGrocery}) {
  if (!open) return null;
  return (
    <Modal
      transparent={true}
      animationType='fade'
    >
      <Pressable 
        className="flex-1 justify-center items-center w-full" 
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} 
        onPress={() => {
          if (Keyboard.isVisible()) {
            Keyboard.dismiss();
          } else {
            setOpen(false);
          }
        }}
      >
        <View className="bg-white w-3/4 py-4 px-8 rounded-xl space-y-4">
          <Text className="font-bold text-2xl mx-auto">Edit Groceries</Text>
          <View className="flex text-left">
            <Text className="font-bold">Name</Text>
            <TextInput className="bg-gray-200 rounded-lg p-2" value={groceryName} onChangeText={newText => setGroceryName(newText)} />
          </View>
          <View className="flex text-left">
            <Text className="font-bold">Days Till Expire</Text>
            <TextInput className="bg-gray-200 rounded-lg p-2" value={daysLeft} onChangeText={newText => setDaysLeft(newText)}/>
          </View>
          <View className="flex-row justify-center space-x-4">
            <TouchableHighlight onPress={() => { Keyboard.dismiss(); saveEditedGrocery(); }} className="rounded-lg">
              <View className="bg-green-500 px-4 py-2 rounded-lg">
                <Text className="text-white">Save</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Pressable>
    </Modal>
  )
}


export function AddGroceryModal({ open, setOpen, groceryName, setGroceryName, addGrocery, isLoading}) {
  if (!open) return null;
  return (
    <Modal
      transparent={true}
      animationType='fade'
    >
      <Pressable 
        className="flex-1 justify-center items-center w-full" 
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} 
        onPress={() => {
          if (Keyboard.isVisible()) {
            Keyboard.dismiss();
          } else {
            setOpen(false);
          }
        }}
      >
        <View className="bg-white w-3/4 py-4 px-8 rounded-xl space-y-4" onStartShouldSetResponder={(event) => true}>
          <Text className="font-bold text-2xl mx-auto">Add Grocery</Text>
          <View className="flex text-left">
            <Text className="font-bold">Name</Text>
            <TextInput className="bg-gray-200 rounded-lg p-2" placeholderTextColor={'#9ca3af'} placeholder="hot dog" value={groceryName} onChangeText={newText => setGroceryName(newText)} />
          </View>
          {
            isLoading &&
            <View className="flex-row justify-center space-x-4">
              <ActivityIndicator size="large"  animating={isLoading} />
            </View>
          }
          <View className="flex-row justify-center space-x-4">
            <TouchableHighlight onPress={() => { Keyboard.dismiss(); addGrocery(); }} className="rounded-lg">
              <View className="bg-green-500 px-4 py-2 rounded-lg">
                <Text className="text-white">Add</Text>
              </View>
            </TouchableHighlight>
          </View>
          
        </View>
      </Pressable>
    </Modal>
  )
}