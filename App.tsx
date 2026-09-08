import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AttendanceRegisterScreen } from './src/screens/AttendanceRegisterScreen';
import { theme } from './src/utils/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AttendanceRegisterScreen />
    </SafeAreaProvider>
  );
}

export default App;
