/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Alert,
    I18nManager
} from 'react-native';

import 'react-native-gesture-handler';
import OneSignal from 'react-native-onesignal'; 
import * as Global from "./app/Global/Global";
import { Constants } from "./app/Global/Constants";
import { EventRegister } from 'react-native-event-listeners';

import RootNavigator from './app/screens/RootNavigator';

import * as DrawerNavigation from './app/utils/ReactNavigation';

var TAG = "App.js";
export default class App extends Component {
 
    constructor(props) {
        super(props);
        
        this.state = {
            
        }

    }

    componentDidMount = async() => {
        // OneSignal.init("9c171cf2-5ad7-4ccb-adb7-1d08cf0f7865");
    
        // OneSignal.addEventListener('received', this.onReceived);
        // OneSignal.addEventListener('opened', this.onOpened);
        // OneSignal.addEventListener('ids', this.onIds);

        // OneSignal.inFocusDisplaying(2);

         /* O N E S I G N A L   S E T U P */
         OneSignal.setAppId("9c171cf2-5ad7-4ccb-adb7-1d08cf0f7865");
         OneSignal.setLogLevel(6, 0);
         OneSignal.setRequiresUserPrivacyConsent(false);
         OneSignal.promptForPushNotificationsWithUserResponse(response => {
             console.log("Prompt response:", response);
         });
 
         /* O N E S I G N A L  H A N D L E R S */
         OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
             console.log("OneSignal: notification will show in foreground:", notifReceivedEvent);
             EventRegister.emit(Constants.NOTIFICATION_CHANGED, "");
         });
         OneSignal.setNotificationOpenedHandler(notification => {
             console.log("OneSignal: notification opened:///////////////", notification);
             DrawerNavigation.navigate('DrawerNavigator', {screen: 'MessagesScreen'});

         });
         OneSignal.setInAppMessageClickHandler(event => {
             console.log("OneSignal IAM clicked:", event);
         });
         OneSignal.addEmailSubscriptionObserver((event) => {
             console.log("OneSignal: email subscription changed: ", event);
         });
         OneSignal.addSubscriptionObserver(event => {
             console.log("OneSignal: subscription changed:", event);
             this.setState({ isSubscribed: event.to.isSubscribed})
         });
         OneSignal.addPermissionObserver(event => {
             console.log("OneSignal: permission changed:", event);
         });
   
         const deviceState = await OneSignal.getDeviceState();
         console.log("OneSignal device ID: ", deviceState.userId)
         Global.DEVICE_PUSH_TOKEN = deviceState.userId;
 
         this.setState({
             isSubscribed : deviceState.isSubscribed
         });
    }

    componentWillUnmount() {
        // OneSignal.removeEventListener('received', this.onReceived);
        // OneSignal.removeEventListener('opened', this.onOpened);
        // OneSignal.removeEventListener('ids', this.onIds);
    }
    
    // onReceived(notification) {
        
    // }
    
    // onOpened(openResult) {
    //     console.log('Message: ', openResult.notification.payload.body);
    //     console.log('Data: ', openResult.notification.payload.additionalData);
    //     console.log('isActive: ', openResult.notification.isAppInFocus);
    //     console.log('openResult: ', openResult);

    //     alert(JSON.stringify(openResult.notification.payload.additionalData))
    
    // }
    
    // onIds(device) {
    //     console.log('Device info11111: ', device);
    //     global.deviceId = device.userId;
    // }


    render() {
        return (
            <View style={{ flex: 1, }}>
                <RootNavigator />
            </View>
        )
    }

}
 