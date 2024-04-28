import { Camera, CameraType } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';


export default function TakePicture({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);
  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function capture() {
    if (camera) {
      const photo = await camera.takePictureAsync();
      navigation.navigate('Confirm', { photo });
    }
  }

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  return (
    <View className="flex-1 justify-center">
      <Camera type={type} ref={(ref) => setCamera(ref)} className="flex-1">
        <View className="flex-row mt-auto py-8 px-8 justify-between items-center bg-black/75">
          
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <MaterialIcons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={capture}>
            <View className="bg-white w-16 h-16 rounded-full justify-center items-center">
              <View className="border-2 w-14 h-14 rounded-full m-2"></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCameraType}>
            <MaterialIcons name="flip-camera-android" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

