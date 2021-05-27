import React, { Component } from "react";
import { View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    TextInput,
    Alert,
    FlatList,
    ScrollView,
    Linking,
    KeyboardAvoidingView,
    Keyboard,
    Modal
 } from "react-native";

import { Colors } from '../utils/Colors';
import { stylesGlobal } from '../Global/stylesGlobal';
import ProgressIndicator from "../components/ProgressIndicator";
import * as Global from "../Global/Global";
import WebService from "../utils/WebService";
import { Constants } from "../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Container from '../components/Container';
import ScheduleCard from '../components/ScheduleCard';
import { buildQuery } from '../utils/utils';
import ModalDropdown from "../components/react-native-modal-dropdown/ModalDropdown";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from '../components/react-native-actionsheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { EventRegister } from 'react-native-event-listeners';

var TAG = "SettingsScreen";

export default class SettingsScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            avatar: Global.AVATAR,
            user_name: Global.FULLNAME,

            current_password: '',
            new_password: '',
            confirm_password: ''
        }

    }

    async UNSAFE_componentWillMount() {
        
    }

    changePassword = async() => {
        if(this.state.current_password.length < 4) {
            Alert.alert(Constants.warnning, Constants.user_password_length_error);
            return;
        } 
        if(this.state.new_password.length < 4) {
            Alert.alert(Constants.warnning, Constants.user_password_length_error);
            return;
        }
        if(this.state.new_password != this.state.confirm_password) {
            Alert.alert(Constants.warnning, Constants.user_password_confirm_error);
            return;
        }
        try {
            this.setState({
                loading: true
            })
            var uri = Global.BASE_URL + "/api/reset_password";
            
            var params = JSON.stringify({
                password: this.state.current_password,
                new_password: this.state.new_password,
                confirm_password: this.state.confirm_password
            })
                                    
            console.log(" callResetPasswordAPI uri " + uri);
            console.log(" callResetPasswordAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleResetPasswordAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleResetPasswordAPI = async(response, isError) => {
        console.log(" callResetPasswordAPI Response " + JSON.stringify(response));
        console.log(" callResetPasswordAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    Global.USER_PASSWORD = this.state.user_password;
                    await AsyncStorage.setItem(Constants.KEY_USER_PASSWORD, this.state.user_password);
                } else {
                    
                }
            } else {
                
            }
        } catch(error) {
            
        }
        this.setState({
            loading: false
        })
    }

    uploadAvatar = async() => {
        try {
            this.setState({
                loading: true
            })
            var uri = Global.BASE_URL + "/api/avatar";
            let localUriTypePart = this.state.avatar.split('.');
            let fileType = localUriTypePart[localUriTypePart.length - 1];
            const newImage = {
                uri: this.state.avatar,
                name: "property_image." + fileType,
                type: `image/${fileType}`,
            }
            var params = new FormData();
            params.append("avatar", newImage);
                                                
            console.log(" callUploadAvatarAPI uri " + uri);
            console.log(" callUploadAvatarAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleUploadAvatarAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleUploadAvatarAPI = async(response, isError) => {
        console.log(" callUploadAvatarAPI Response " + JSON.stringify(response));
        console.log(" callUploadAvatarAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    Global.AVATAR = Global.BASE_URL + response.user.avatar;
                    EventRegister.emit(Constants.PROFILE_CHANGED, '');
                } else {
                    
                }
            } else {
                
            }
        } catch(error) {
            
        }
        this.setState({
            loading: false
        })
    }

    render() {
        return (
            <Container style = {{flex: 1}} navigation = {this.props.navigation}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
                <ActionSheet
                    ref={o => this.SelectImageActionSheet = o}
                    title={"Select Image"}
                    options={["Select from Camera", "Select from Library", "Cancel"]}
                    cancelButtonIndex={2}
                    // destructiveButtonIndex={1}
                    onPress={(index) => { 
                        var options = {
                            mediaType: 'photo',
                            includeBase64: false,
                        };
                        if(index == 0) {
                            launchCamera(options, (response) => {
                                console.log('Response = ', response.type);
                    
                                if (response.didCancel) {
                                    console.log('User cancelled image picker');
                                } else if (response.error) {
                                    console.log('ImagePicker Error: ', response.error);
                                } else if (response.customButton) {
                                    console.log('User tapped custom button: ', response.customButton);
                                } else {
                                    this.setState({
                                        avatar: response.uri
                                    }, () => this.uploadAvatar())
                                }
                            });
                        } else if(index == 1) {
                            launchImageLibrary(options, (response) => {
                                console.log('Response = ', response.type);
                    
                                if (response.didCancel) {
                                    console.log('User cancelled image picker');
                                } else if (response.error) {
                                    console.log('ImagePicker Error: ', response.error);
                                } else if (response.customButton) {
                                    console.log('User tapped custom button: ', response.customButton);
                                } else {
                                    this.setState({
                                        avatar: response.uri
                                    }, () => this.uploadAvatar())
                                }
                            });
                        }
                    }}
                />
                <KeyboardAwareScrollView style = {{flex: 1}}>
                    <View style = {{width: '100%', backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', paddingVertical: 30}}>
                        <View style = {{width: 120, height: 100, alignItems: 'center'}}>
                            <View style = {{height: '100%', aspectRatio: 1, borderRadius: 50, overflow: 'hidden'}}>
                            {
                                this.state.avatar != null && this.state.avatar != "" &&
                                <Image style = {{width: '100%', height: '100%', resizeMode: 'cover'}} source = {{uri: this.state.avatar}}></Image>
                            }
                            {
                                !(this.state.avatar != null && this.state.avatar != "") &&
                                <Image style = {{width: '100%', height: '100%', resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/user_avatar.png')}></Image>
                            }
                            </View>
                            <TouchableOpacity style = {{padding: 5, position: 'absolute', bottom: 0, right: 0}} onPress = {() => this.SelectImageActionSheet.show()}>
                                <Image style = {{width: 20, height: 20, tintColor: Colors.white}} source = {require('../assets/images/edit.png')}></Image>
                            </TouchableOpacity>
                        </View>
                        <Text style = {{fontSize: 24, color: Colors.white, marginTop: 10}}>{this.state.user_name}</Text>
                    </View>
                    <View style = {{width: '100%', paddingHorizontal: 15, paddingTop: 15}}>
                        <View style = {styles.component_view}>
                            <TextInput style = {styles.text_input} placeholder = {"Current Password*"} placeholderTextColor = {Colors.grey} secureTextEntry = {true}
                                onChangeText = {(text) => {
                                    this.setState({
                                        current_password: text
                                    })
                                }}
                            >{this.state.current_password}</TextInput>
                        </View>
                        <View style = {styles.component_view}>
                            <TextInput style = {styles.text_input} placeholder = {"New Password*"} placeholderTextColor = {Colors.grey} secureTextEntry = {true}
                                onChangeText = {(text) => {
                                    this.setState({
                                        new_password: text
                                    })
                                }}
                            >{this.state.new_password}</TextInput>
                        </View>
                        <View style = {styles.component_view}>
                            <TextInput style = {styles.text_input} placeholder = {"Confirm Password*"} placeholderTextColor = {Colors.grey} secureTextEntry = {true}
                                onChangeText = {(text) => {
                                    this.setState({
                                        confirm_password: text
                                    })
                                }}
                            >{this.state.confirm_password}</TextInput>
                        </View>
                        <TouchableOpacity style = {{width: '100%', height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 5, backgroundColor: Colors.primary, marginTop: 15}}
                            onPress = {() => this.changePassword()}
                        >
                            <Text style = {{fontSize: 16, color: Colors.white}}>{"RESET PASSWORD"}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    component_view: {
        width: '100%',
        height: 50,
        padding: 10,
        borderWidth: 0.5,
        borderColor: Colors.grey,
        borderRadius: 5,
        marginTop: 15,
        justifyContent: 'center'
    },
    text_input: {
        width: '100%',
        height: '100%',
        fontSize: 14,
        color: Colors.primary,
        padding: 0
    },
})