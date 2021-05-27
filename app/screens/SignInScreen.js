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
import ProgressIndicator from "../components/ProgressIndicator";
import * as Global from "../Global/Global";
import WebService from "../utils/WebService";
import { Constants } from "../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

var TAG = "SignInScreen";

export default class SignInScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_email: "",
            user_password: "",
            password_hide: true,
            loading: false,
        }
    }

    async componentDidMount() {

    }

    user_signin = async() => {
        try {
            if(this.state.user_email.length == 0) {
                Alert.alert(Constants.warnning, Constants.user_email_error);
                return;
            }
            if(this.state.user_password.length < 4) {
                Alert.alert(Constants.warnning, Constants.user_password_length_error);
                return;
            }
            this.setState({
                loading: true,
            });

            var uri = Global.BASE_URL + "/api/login";
            let params = JSON.stringify({
                "email": this.state.user_email,
                "password": this.state.user_password,
                "device_token": Global.DEVICE_PUSH_TOKEN
            })
                                    
            console.log(TAG + " callSignInAPI uri " + uri);
            console.log(TAG + " callSignInAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleSignInAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleSignInAPI = async(response, isError) => {
        console.log(TAG + " callSignInAPI Response " + JSON.stringify(response));
        console.log(TAG + " callSignInAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    Global.USER_EMAIL = this.state.user_email;
                    Global.USER_PASSWORD = this.state.user_password;
                    Global.API_TOKEN = response.access_token;
                    Global.FULLNAME = response.user.name;
                    if(response.user.avatar != null && response.user.avatar != "") {
                        Global.AVATAR = Global.BASE_URL + response.user.avatar;
                    } else {
                        Global.AVATAR = null;
                    }
                    Global.USER_ROLE = response.user.role;
                    if(response.user.memberships != null && response.user.memberships.length > 0) {
                        Global.MEMBERSHIPS = response.user.memberships[0].membership_id;
                    } else {
                        Global.MEMBERSHIPS = null;
                    }

                    await AsyncStorage.setItem(Constants.KEY_USER_EMAIL, this.state.user_email);
                    await AsyncStorage.setItem(Constants.KEY_USER_PASSWORD, this.state.user_password);
                    
                    this.props.navigation.reset({index: 0, routes: [{name: "DrawerNavigator"}]});
                } else {
                    
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
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
                <View style = {{width: '100%', alignItems: 'center', paddingVertical: 100, backgroundColor: Colors.white, borderRadius: 10}}>
                    <View style = {{width: '80%'}}>
                        <Image style = {{width: '100%', height: 80, resizeMode: 'contain'}} source = {require('../assets/images/logo_signin.png')}></Image>
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
                        <TouchableOpacity style = {[styles.input_view, {marginTop: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary}]} onPress = {() => this.user_signin()}>
                            <Text style = {{fontSize: 18, color: Colors.white}}>{"Login"}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{width: '100%', position: 'absolute', bottom: 15, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                        <Text style = {{fontSize: 16, color: Colors.primary}}>{"Don't have an account?"}</Text>
                        <TouchableOpacity style = {{marginStart: 15}} onPress = {() => this.props.navigation.navigate("SignUpScreen")}>
                            <Text style = {{fontSize: 16, color: Colors.secondary}}>{"Register"}</Text>
                        </TouchableOpacity>
                    </View>
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