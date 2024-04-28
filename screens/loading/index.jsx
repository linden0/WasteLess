import { View, Text, ActivityIndicator } from "react-native";


export default function Loading() {
  return (
    <View className="flex-1 justify-center items-center bg-green-500">
      <Text className="text-white  text-center text-2xl font-bold mb-4">Detecting grocery items...</Text>
      <ActivityIndicator size="large" color="#ffffff" />

    </View>
  )
}