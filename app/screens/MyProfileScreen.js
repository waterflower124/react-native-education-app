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
    Linking
 } from "react-native";

import { Colors } from '../utils/Colors';
import { stylesGlobal } from '../Global/stylesGlobal';
import ProgressIndicator from "../components/ProgressIndicator";
import * as Global from "../Global/Global";
import WebService from "../utils/WebService";
import { Constants } from "../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Container from '../components/Container';
import PlayerCoachCard from '../components/PlayerCoachCard';
import GameCard from '../components/GameCard';
import ScheduleCard from '../components/ScheduleCard';
import { buildQuery } from '../utils/utils';
import ModalDropdown from "../components/react-native-modal-dropdown/ModalDropdown";
import ScrollableTabView, {
    ScrollableTabBar
} from "react-native-scrollable-tab-view-universal";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from '../components/react-native-actionsheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { EventRegister } from 'react-native-event-listeners';
import {validateIsEmail} from '../utils/utils';


import PersonalInfo from './myProfile/PersonalInfo';
import AboutMe from './myProfile/AboutMe';
import Photos from './myProfile/Photos';
import Videos from './myProfile/Videos';
import Schedules from './myProfile/Schedules';

var TAG = "MyProfileScreen";

export default class MyProfileScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            loading: false,
            my_profile: null,
            avatar: Global.AVATAR,
            my_photos: [],
            my_videos: [],

            current_page: 0,
        }

    }

    async UNSAFE_componentWillMount() {
        this.getMyProfile();
    }

    getMyProfile = async() => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/my_profile";
                                                
            console.log(TAG + " callGetMyProfileAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetMyProfileAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleGetMyProfileAPI = async(response, isError) => {
        console.log(TAG + " callGetMyProfileAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetMyProfileAPI isError " + isError);
        try {
            if(!isError) {
                this.setState({
                    my_profile: response.profile
                })
                if(response.resources != null) {
                    var my_photos = [];
                    var my_videos = [];
                    for(var i = 0; i < response.resources.length; i ++) {
                        if(response.resources[i].type == "IMAGE") {
                            response.resources[i].imageLoading = true;
                            response.resources[i].source = {uri: Global.BASE_URL + response.resources[i].url};
                            my_photos.push(response.resources[i]);
                        } else if(response.resources[i].type == "VIDEO") {
                            my_videos.push(response.resources[i]);
                        }
                    }
                    this.setState({
                        my_photos: my_photos,
                        my_videos: my_videos
                    })
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }
        this.setState({
            loading: false,
            refreshing: false
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

    modifyProfile = async(key, value) => {

        var my_profile = this.state.my_profile;
        my_profile[key] = value;
        this.setState({
            my_profile: my_profile
        })
    }

    saveProfile = async() => {
        if(this.state.my_profile.name == "") {
            Alert.alert(Constants.warnning, "Please input Name");
            return;
        } 
        if(!validateIsEmail(this.state.my_profile.email)) {
            Alert.alert(Constants.warnning, Constants.user_email_error);
            return;
        }
        
        try {
            this.setState({
                loading: true
            })
            var uri = Global.BASE_URL + "/api/profile";
            
            var params = JSON.stringify(this.state.my_profile)
                                    
            console.log(" callSaveProfileAPI uri " + uri);
            console.log(" callSaveProfileAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleSaveProfileAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleSaveProfileAPI = async(response, isError) => {
        console.log(" callSaveProfileAPI Response " + JSON.stringify(response));
        console.log(" callSaveProfileAPI isError " + isError);
        try {
            if(!isError) {
                Global.USER_EMAIL = this.state.my_profile.email;
                Global.FULLNAME= this.state.my_profile.name;
                await AsyncStorage.setItem(Constants.KEY_USER_EMAIL, this.state.my_profile.email);
                EventRegister.emit(Constants.PROFILE_CHANGED, '');
            } else {
                
            }
        } catch(error) {
            
        }
        this.setState({
            loading: false
        })
    }

    modifyPhotos = () => {

    }

    render() {
        return (
            <Container style = {{flex: 1, width: '100%', height: '100%'}} navigation = {this.props.navigation}>
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
                <KeyboardAwareScrollView style = {{width: '100%'}} >
                {
                    this.state.my_profile != null &&
                    <View style = {{flex: 1, width: '100%'}}>
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
                            <Text style = {{fontSize: 24, color: Colors.white, marginTop: 10}}>{this.state.my_profile.name}</Text>
                            <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, backgroundColor: Colors.secondary, marginTop: 10}} onPress = {() => this.saveProfile()}>
                                <Text style = {{fontSize: 16, color: Colors.primary}}>{"Save"}</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollableTabView
                            style={{ flex: 1, width: '100%' }}
                            tabBarBackgroundColor={Colors.transparent}
                            tabBarActiveTextColor={Colors.primary}
                            tabBarTextStyle = {{fontSize: 16, color: Colors.primary}}
                            locked={true}
                            ref='scrollableTab'
                            tabBarUnderlineStyle={{ backgroundColor: Colors.primary }}
                            tabBarInactiveTextColor={Colors.light_grey}
                            // onChangeTab={(data) => this.updateTabContent(data)}
                            renderTabBar={() => <ScrollableTabBar />}
                            initialPage = {0}
                            // page={this.state.current_page}
                            onChangeTab = {(index_obj) => {this.setState({ current_page: index_obj.i})}}
                        >
                            <PersonalInfo
                                ref="tab_personalinfo"
                                tabLabel="PERSONAL INFO"
                                my_profile = {this.state.my_profile}
                                navigation={this.props.navigation}
                                modifyProfile = {this.modifyProfile}
                                setLoading = {this.setLoading}
                            />
                        {
                            this.state.my_profile.role == "PLAYER" &&
                            <AboutMe
                                ref="tab_aboutme"
                                tabLabel="ABOUT ME"
                                my_profile = {this.state.my_profile}
                                navigation={this.props.navigation}
                                modifyProfile = {this.modifyProfile}
                                setLoading = {this.setLoading}
                            />
                        }
                            <Photos
                                ref="tab_photos"
                                tabLabel="PHOTOS"
                                my_profile = {this.state.my_profile}
                                my_photos = {this.state.my_photos}
                                navigation={this.props.navigation}
                                modifyPhotos = {this.modifyPhotos}
                                setLoading = {this.setLoading}
                            />
                            <Videos
                                ref="tab_videos"
                                tabLabel="VIDEOS"
                                my_profile = {this.state.my_profile}
                                my_videos = {this.state.my_videos}
                                navigation={this.props.navigation}
                                modifyPhotos = {this.modifyPhotos}
                                setLoading = {this.setLoading}
                            />
                        {
                            this.state.my_profile.role == "PLAYER" &&
                            <Schedules
                                ref="tab_schedule"
                                tabLabel="SCHEDULES"
                                my_profile = {this.state.my_profile}
                                navigation={this.props.navigation}
                                setLoading = {this.setLoading}
                            />
                        }
                        {
                            this.state.my_profile.role == "COACH" &&
                            <Schedules
                                ref="tab_schedule"
                                tabLabel="CAMP DATES/SEASON SCHEDULE"
                                my_profile = {this.state.my_profile}
                                navigation={this.props.navigation}
                                setLoading = {this.setLoading}
                            />
                        }
                        </ScrollableTabView>
                    </View>
                }
                </KeyboardAwareScrollView>
            {
                this.state.my_profile != null && ((this.state.my_profile.role == "PLAYER" && this.state.current_page == 4) || (this.state.my_profile.role == "COACH" && this.state.current_page == 3)) &&
                <View style = {{position: 'absolute', bottom: 20, right: 20, }}>
                    <TouchableOpacity style = {{width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.refs.tab_schedule.openModal(-1)}>
                        <Image style = {{width: 30, height: 30, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/plus.png')}></Image>
                    </TouchableOpacity>
                </View>
            }
            </Container>
        )
    }

    setLoading = (loading) => {
        this.setState({
            loading: loading
        })
    }
}

const styles = StyleSheet.create({
    action_button: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        // borderColor: Colors.secondary,
        borderWidth: 1,
        borderRadius: 5,
        marginHorizontal: 5
    },
    button_text: {
        fontSize: 16
    }
})