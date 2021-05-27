import React, { Component } from "react";
import { View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    TextInput,
    Alert
 } from "react-native";

import { Colors } from '../utils/Colors';
import { stylesGlobal } from '../Global/stylesGlobal';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ProgressIndicator from "../components/ProgressIndicator";
import * as Global from "../Global/Global";
import WebService from "../utils/WebService";
import { Constants } from "../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalDropdown from "../components/react-native-modal-dropdown/ModalDropdown";
import { EventRegister } from 'react-native-event-listeners';

var TAG = "HomeScreen";

export default class Container extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            user_full_name: Global.FULLNAME,
            user_avatar: Global.AVATAR,
            user_email: Global.USER_EMAIL,
            unread_message_count: 0,

            popup_array: [
                {label: "My Profile", icon: require('../assets/images/user_avatar.png'), screen_name: "MyProfileScreen"}, 
                {label: "Messages", icon: require('../assets/images/user_email.png'), screen_name: "MessagesScreen"}, 
                {label: "Settings", icon: require('../assets/images/setting.png'), screen_name: "SettingsScreen"}, 
                {label: "Logout", icon: require('../assets/images/logout.png'), screen_name: "SignInScreen"}
            ]
        }
    }

    async UNSAFE_componentWillMount() {
        if(this.state.user_role == "ADMIN") {
            var popup_array = this.state.popup_array;
            popup_array.splice(0, 1);
            this.setState({
                popup_array: popup_array
            })
        }
        this.profileChangeListener = EventRegister.addEventListener(Constants.PROFILE_CHANGED, async() => {
            this.setState({
                user_full_name: Global.FULLNAME,
                user_avatar: Global.AVATAR,
                user_email: Global.USER_EMAIL,
            })
        })
        this.notificationChangeListener = EventRegister.addEventListener(Constants.NOTIFICATION_CHANGED, async() => {
            this.getUnreadMessages();
        })

        this.getUnreadMessages();
    }

    getUnreadMessages = async() => {
        try {
            var uri = Global.BASE_URL + "/api/unread_message";
                                     
            console.log(TAG + " callGetUnreadMessagesAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetUnreadMessagesAPI);
        } catch (error) {
            console.log(error)
            
        }
    }

    handleGetUnreadMessagesAPI = async(response, isError) => {
        console.log(TAG + " callGetUnreadMessagesAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetUnreadMessagesAPI isError " + isError);
        try {
            if(!isError) {
                if(response != null && response.count != null) {
                    this.setState({
                        unread_message_count: response.count
                    })
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }

    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.main_background}}>
                <View style = {{width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: Colors.white, shadowColor: '#000',
        shadowOffset: { width: 1, height: 3 },
        shadowOpacity:  0.2,
        shadowRadius: 5,
        elevation: 5, zIndex: 10}}>
                    <TouchableOpacity style = {{height: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.props.navigation.openDrawer()}>
                        <Image style = {{width: '50%', height: '50%', resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/menu_button.png')}></Image>
                    </TouchableOpacity>
                    <View style = {{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                        <TouchableOpacity style = {{height: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.props.navigation.navigate("MessagesScreen")}>
                            <Image style = {{width: '50%', height: '50%', resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/notification_bell.png')}></Image>
                        {
                            this.state.unread_message_count != 0 &&
                            <View style = {{width: 15, height: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: Colors.noti_background, position: 'absolute', top: 5, right: 5, zIndex: 10, elevation: 1}}>
                                <Text style = {{fontSize: 10, color: Colors.white}}>{this.state.unread_message_count}</Text>
                            </View>
                        }
                        </TouchableOpacity>
                        {/* <TouchableOpacity style = {{height: '80%', aspectRatio: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10, backgroundColor: Colors.grey, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
                        {
                            this.state.user_avatar != null && this.state.user_avatar != "" &&
                            <Image style = {{width: '100%', height: '100%', resizeMode: 'contain'}} source = {{uri: this.state.user_avatar}}></Image>
                        }
                        {
                            !(this.state.user_avatar != null && this.state.user_avatar != "") &&
                            <Text style = {{fontSize: 20, color: Colors.white}}>{this.state.user_full_name.charAt(0).toUpperCase()}</Text>
                        }
                        </TouchableOpacity> */}
                        <ModalDropdown 
                            dropdownStyle = {{width: 150, height: 40 * this.state.popup_array.length}}
                            defaultIndex = {0}
                            options = {this.state.popup_array}
                            onSelect = {(index) => {
                                this.props.navigation.navigate(this.state.popup_array[index].screen_name)
                            }}
                            renderButton = {() => {
                                return (
                                    <View style = {{height: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center'}}>
                                        <View style = {{width: '80%', height: '80%', borderRadius: 20, marginLeft: 10, backgroundColor: Colors.grey, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
                                        {
                                            this.state.user_avatar != null && this.state.user_avatar != "" &&
                                            <Image style = {{width: '100%', height: '100%', resizeMode: 'cover'}} source = {{uri: this.state.user_avatar}}></Image>
                                        }
                                        {
                                            !(this.state.user_avatar != null && this.state.user_avatar != "") &&
                                            <Text style = {{fontSize: 20, color: Colors.white}}>{this.state.user_full_name.charAt(0).toUpperCase()}</Text>
                                        }
                                        </View>
                                    </View>
                                )
                            }}
                            renderRow = {(item, index, highlighted) => {
                                return (
                                    <View key = {index} style = {{width: 150, height: 40, flexDirection: 'row', alignItems: 'center', paddingStart: 10}}>
                                        <Image style = {{width: 20, height:20, tintColor: Colors.grey, resizeMode: 'contain'}} source={item.icon}/>
                                        <Text style = {{fontSize: 14, color: Colors.grey, marginStart: 10}}>{item.label}</Text>
                                    </View>
                                )
                            }}
                        />
                    </View>
                </View>
            {
                (this.props.children)
            }  
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({

})