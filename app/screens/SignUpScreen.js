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
    KeyboardAvoidingView
 } from "react-native";

import { Colors } from '../utils/Colors';
import { stylesGlobal } from '../Global/stylesGlobal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ProgressIndicator from "../components/ProgressIndicator";
import * as Global from "../Global/Global";
import WebService from "../utils/WebService";
import { Constants } from "../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

var TAG = "SignUpScreen";

export default class SignUpScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_name: "",
            user_email: "",
            user_password: "",
            user_password_confirm: "",
            password_hide: true,
            confirm_password_hide: true,
            loading: false,
            selected_user_role: "PLAYER", // PLAYER, COACH
        }
    }

    async componentDidMount() {


    }

    user_register = async() => {
        try {
            if(this.state.user_email.length == 0) {
                Alert.alert(Constants.warnning, Constants.user_email_error);
                return;
            }
            if(this.state.user_password.length < 4) {
                Alert.alert(Constants.warnning, Constants.user_password_length_error);
                return;
            }
            if(this.state.user_password != this.state.user_password_confirm) {
                Alert.alert(Constants.warnning, Constants.user_password_confirm_error);
                return;
            }
            this.setState({
                loading: true,
            });
            var uri = Global.BASE_URL + "/api/register";
            
            let params = JSON.stringify({
                "name": this.state.user_name,
                "email": this.state.user_email,
                "password": this.state.user_password
            })
                                    
            console.log(TAG + " callRegisterAPI uri " + uri);
            console.log(TAG + " callRegisterAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleRegisterAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleRegisterAPI = async(response, isError) => {
        console.log(TAG + " callRegisterAPI Response " + JSON.stringify(response));
        console.log(TAG + " callRegisterAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    Global.USER_EMAIL = this.state.user_email;
                    Global.USER_PASSWORD = this.state.user_password;
                    Global.API_TOKEN = response.access_token;
                    Global.FULLNAME = response.user.name;
                    Global.AVATAR = response.user.avatar;
                    Global.USER_ROLE = response.user.role;
                    Global.MEMBERSHIPS = response.user.memberships;

                    await AsyncStorage.setItem(Constants.KEY_USER_EMAIL, this.state.user_email);
                    await AsyncStorage.setItem(Constants.KEY_USER_PASSWORD, this.state.user_password);

                    Alert.alert("Success", "Success Register");
                    
                    // this.props.navigation.reset({index: 0, routes: [{name: "DrawerNavigator"}]});
                } else {
                    Alert.alert(Constants.warnning, "Failed Register. Please try again.");
                }
            } else {
                Alert.alert(Constants.warnning, "Failed Register. Please try again.");
            }
        } catch(error) {
            console.log("signin catch error", error);
            Alert.alert(Constants.warnning, "Failed Register. Please try again.");
        }
        this.setState({
            loading: false
        })
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 30}}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
            
                <View style = {{width: '100%', alignItems: 'center', paddingTop: 100, backgroundColor: Colors.white, borderRadius: 10}}>
                <KeyboardAwareScrollView behavior={Platform.OS == "ios" ? "padding" : null} style = {{width: '80%'}} enableOnAndroid = {true}>
                    <View style = {{width: '100%'}}>
                        <Image style = {{width: '100%', height: 80, resizeMode: 'contain'}} source = {require('../assets/images/logo_signin.png')}></Image>
                        <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                            <Text style = {{fontSize: 14, color: Colors.primary}}>{"I am a:"}</Text>
                            <View style = {{flex: 1, height: 40, marginStart: 15, flexDirection: 'row'}}>
                                <TouchableOpacity style = {{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.selected_user_role == "PLAYER" ? Colors.secondary : Colors.light_grey}} onPress = {() => this.setState({selected_user_role: "PLAYER"})}>
                                    <Text style = {{fontSize: 16, color: Colors.black}}>{"PLAYER"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style = {{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.selected_user_role == "COACH" ? Colors.secondary : Colors.light_grey}} onPress = {() => this.setState({selected_user_role: "COACH"})}>
                                    <Text style = {{fontSize: 16, color: Colors.black}}>{"COACH"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.text_input} placeholder = {"Name*"} placeholderTextColor = {Colors.grey} onChangeText = {(text) => this.setState({user_name: text})}>{this.state.user_name}</TextInput>
                            <View style = {styles.image_view}>
                                <Image style = {{width: '50%', height: '50%', resizeMode: 'contain'}} source = {require('../assets/images/user_name.png')}></Image>
                            </View>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.text_input} placeholder = {"Username/Email*"} placeholderTextColor = {Colors.grey} keyboardType = {"email-address"} onChangeText = {(text) => this.setState({user_email: text})}>{this.state.user_email}</TextInput>
                            <View style = {styles.image_view}>
                                <Image style = {{width: '50%', height: '50%', resizeMode: 'contain'}} source = {require('../assets/images/user_email.png')}></Image>
                            </View>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.text_input} placeholder = {"Password*"} placeholderTextColor = {Colors.grey} secureTextEntry = {this.state.password_hide} onChangeText = {(text) => this.setState({user_password: text})}>{this.state.user_password}</TextInput>
                            <TouchableOpacity style = {styles.image_view} onPress = {() => this.setState({password_hide: !this.state.password_hide})}>
                                <Image style = {{width: '50%', height: '50%', resizeMode: 'contain'}} source = {this.state.password_hide ? require('../assets/images/user_password_hide.png') : require('../assets/images/user_password_show.png')}></Image>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput style = {styles.text_input} placeholder = {"Confirm Password*"} placeholderTextColor = {Colors.grey} secureTextEntry = {this.state.confirm_password_hide} onChangeText = {(text) => this.setState({user_password_confirm: text})}>{this.state.user_password_confirm}</TextInput>
                            <TouchableOpacity style = {styles.image_view} onPress = {() => this.setState({confirm_password_hide: !this.state.confirm_password_hide})}>
                                <Image style = {{width: '50%', height: '50%', resizeMode: 'contain'}} source = {this.state.confirm_password_hide ? require('../assets/images/user_password_hide.png') : require('../assets/images/user_password_show.png')}></Image>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style = {[styles.input_view, {marginTop: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary}]} onPress = {() => this.user_register()}>
                            <Text style = {{fontSize: 18, color: Colors.white}}>{"Register"}</Text>
                        </TouchableOpacity>
                        
                    </View>
                    <View style = {{width: '100%', marginTop: 60, marginBottom: 15, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                        <Text style = {{fontSize: 16, color: Colors.primary}}>{"Aleady have an account?"}</Text>
                        <TouchableOpacity style = {{marginStart: 15}} onPress = {() => this.props.navigation.goBack()}>
                            <Text style = {{fontSize: 16, color: Colors.secondary}}>{"Login"}</Text>
                        </TouchableOpacity>
                    </View>
                    </KeyboardAwareScrollView>
                </View>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    input_view: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 5,
        flexDirection: 'row',
        marginTop: 15
    },
    text_input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        color: Colors.black,
        fontSize: 16
    },
    image_view: {
        height: '100%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})