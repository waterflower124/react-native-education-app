
import React, { Component } from "react";

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from "./SplashScreen";
import SignInScreen from "./SignInScreen";
import SignUpScreen from "./SignUpScreen";
import DrawerNavigator from "./DrawerNavigator";

import {navigationRef} from '../utils/ReactNavigation';

const Stack = createStackNavigator();


export default class RootNavigator extends Component {

    constructor(props) {
        super(props);
        
    }

    render() {
        return (
            <NavigationContainer ref = {navigationRef}>
                <Stack.Navigator headerMode = "none" screenOptions = {{gestureEnabled: false}}>
                    <Stack.Screen name = "SplashScreen" component = {SplashScreen}/>
                    <Stack.Screen name = "SignInScreen" component = {SignInScreen}/>
                    <Stack.Screen name = "SignUpScreen" component = {SignUpScreen}/>
                    <Stack.Screen name = "DrawerNavigator" component = {DrawerNavigator}/>
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}