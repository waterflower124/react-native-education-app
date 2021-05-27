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

var TAG = "SplashScreen";

export default class SplashScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_email: "",
            user_password: "",
        }
    }

    async componentDidMount() {

        setTimeout(async() => {
            try {
                var user_email = await AsyncStorage.getItem(Constants.KEY_USER_EMAIL);
                var user_password = await AsyncStorage.getItem(Constants.KEY_USER_PASSWORD);
                this.setState({
                    user_email: user_email,
                    user_password: user_password,
                }, () => {
                    if(this.state.user_email != null && this.state.user_email != "" && this.state.user_password != null && this.state.user_password!= "") {
                        this.user_signin();
                    } else {
                        this.props.navigation.reset({index: 0, routes: [{name: "SignInScreen"}]});
                    }
                })
                
            } catch(error) {
    
            }
        }, 1000);
    }

    user_signin = async() => {
        try {
            if(this.state.user_email.length == 0) {
                Alert.alert(strings.warnning, strings.id_iqama_length_error);
                return;
            }
            if(this.state.user_password.length < 6) {
                Alert.alert(strings.warnning, strings.password_error);
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
                // Global.API_TOKEN = response.token;
                // this.props.navigation.reset({index: 0, routes: [{name: "DrawerNavigator"}]});
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
                    
                    this.props.navigation.reset({index: 0, routes: [{name: "DrawerNavigator"}]});
                } else {
                    this.props.navigation.reset({index: 0, routes: [{name: "SignInScreen"}]});
                }
            } else {
                this.props.navigation.reset({index: 0, routes: [{name: "SignInScreen"}]});
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary}}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
                <Image style = {{width: '50%', height: '100%', resizeMode: 'contain'}} source = {require('../assets/images/logo_splash.png')}/>
            </View>
        )
    }
}