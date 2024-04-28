import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/home';
import TakePicture from './screens/camera';
import ConfirmGroceries from './screens/confirm';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} options={{headerShown: false}}/>
        <Stack.Screen name="Camera" component={TakePicture} options={{headerShown: false}}/>
        <Stack.Screen name="Confirm" component={ConfirmGroceries} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}



