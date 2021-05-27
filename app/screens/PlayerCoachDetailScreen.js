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
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

import Information from './userDetail/Information';
import Photos from './userDetail/Photos';
import Videos from './userDetail/Videos';
import Schedules from './userDetail/Schedules';
import TranscriptEligibility from './userDetail/TranscriptEligibility';

var TAG = "PlayerCoachDetailScreen";

export default class PlayerCoachDetailScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            loading: false,
            profile_id: this.props.route.params.profile_id,
            user_profile: null,
            user_photos: [],
            user_videos: [],

            message_send_popup: false,
            send_message: "",

            current_page: 0,
        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        this.getProfile();
    }

    getProfile = async() => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/profile/" + this.state.profile_id;
                                                
            console.log(TAG + " callGetProfileAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetProfileAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleGetProfileAPI = async(response, isError) => {
        console.log(TAG + " callGetProfileAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetProfileAPI isError " + isError);
        try {
            if(!isError) {
                this.setState({
                    user_profile: response.profile
                })
                if(response.resources != null) {
                    var user_photos = [];
                    var user_videos = [];
                    for(var i = 0; i < response.resources.length; i ++) {
                        if(response.resources[i].type == "IMAGE") {
                            user_photos.push(response.resources[i]);
                        } else if(response.resources[i].type == "VIDEO") {
                            user_videos.push(response.resources[i]);
                        }
                    }
                    this.setState({
                        user_photos: user_photos,
                        user_videos: user_videos
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

    messageSend = async() => {
        this.setState({
            message_send_popup: true
        })
    }

    sendRecruitsMessage = async() => {
        if(this.state.send_message == "") {
            Alert.alert(Constants.warnning, Constants.recruits_send_empty_message);
            return;
        }
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/message";
            let params = JSON.stringify({
                receivers: [this.state.user_profile.id], 
                message: this.state.send_message
            })                                    
            
            console.log(TAG + " callSendRecruitsMessageAPI uri " + uri);
            console.log(TAG + " callSendRecruitsMessageAPI params " + params);

            WebService.callServicePost(uri, params, this.handleSendRecruitsMessageAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleSendRecruitsMessageAPI = async(response, isError) => {
        console.log(TAG + " callSendRecruitsMessageAPI Response " + JSON.stringify(response));
        console.log(TAG + " callSendRecruitsMessageAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.setState({
                        message_send_popup: false,
                        send_message: ''
                    })
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

    coachEnableDisable = () => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/user_status/" + this.state.user_profile.id;
                                                
            var status = this.state.user_profile.status == "DISABLE" ? "ACTIVE" : "DISABLE";
            let params = JSON.stringify({
                status: status
            })

            console.log(TAG + " callCoachEnableDisableAPI uri " + uri);
            console.log(TAG + " callSendRecruitsMessageAPI params " + params);

            WebService.callServicePost(uri, params, this.handleCoachEnableDisableAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleCoachEnableDisableAPI = async(response, isError) => {
        console.log(TAG + " callCoachEnableDisableAPI Response " + JSON.stringify(response));
        console.log(TAG + " callCoachEnableDisableAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    var user_profile = this.state.user_profile;
                    if(user_profile.status == "DISABLE") {
                        user_profile.status = "ACTIVE";
                    } else {
                        user_profile.status = "DISABLE";
                    }
                    this.setState({
                        user_profile: user_profile
                    })
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
            <Container style = {{flex: 1, width: '100%', height: '100%'}} navigation = {this.props.navigation}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
            {
                this.state.message_send_popup &&
                <View style = {{width: '100%', height: '100%', position: 'absolute', zIndex: 10, elevation: 10, alignItems: 'center', justifyContent: 'center'}}>
                    <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.black, opacity: 0.3}}></View>
                    <View style = {{width: '90%', backgroundColor: Colors.white, borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10}}>
                        <Text style = {{fontSize: 16, color: Colors.black}}>{"To " + this.state.user_profile.name}</Text>
                        <TextInput style = {{width: '100%', height: 100, marginVertical: 15, padding: 15, color: Colors.black, fontSize: 14, borderColor: Colors.grey, borderWidth: 1, borderRadius: 5}} placeholder = {"Message"} placeholderTextColor = {Colors.grey} multiline = {true} onChangeText = {(text) => this.setState({send_message: text})}>{this.state.send_message}</TextInput>
                        <View style = {{width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: Colors.black, borderRadius: 5, backgroundColor: Colors.black}} onPress = {() => this.sendRecruitsMessage()}>
                                <Text style = {{fontSize: 16, color: Colors.white}}>{"SEND"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: Colors.black, borderRadius: 5, marginStart: 10}} onPress = {() => this.setState({message_send_popup: false, send_message: ''})}>
                                <Text style = {{fontSize: 16, color: Colors.black}}>{"CANCEL"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
                <ScrollView style = {{width: '100%'}} >
                {
                    this.state.user_profile != null &&
                    <View style = {{flex: 1, width: '100%'}}>
                        <View style = {{width: '100%', backgroundColor: Colors.primary, alignItems: 'center'}}>
                            <View style = {{width: 120, aspectRatio: 1, borderRadius: 60, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.grey, marginTop: 30}}>
                            {
                                this.state.user_profile.avatar != null && this.state.user_profile.avatar != "" &&
                                <Image style = {{width: '100%', height: '100%', resizeMode: 'cover'}} source = {{uri: Global.BASE_URL + this.state.user_profile.avatar}}></Image>
                            }
                            {
                                !(this.state.user_profile.avatar != null && this.state.user_profile.avatar != "") && 
                                <View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 60, borderWidth: 2, borderColor: Colors.white}}>
                                    <Text style = {{fontSize: 56, color: Colors.white,}}>{this.state.user_profile.name.charAt(0).toUpperCase()}</Text>
                                </View>
                            } 
                            </View>
                            <Text style = {{fontSize: 24, color: Colors.white, marginTop: 15}}>{this.state.user_profile.name}</Text>
                            <View style = {{flexDirection: 'row', marginVertical: 15}}>
                            {
                                this.state.user_profile.role == "COACH" && this.state.user_role == "ADMIN" &&
                                <TouchableOpacity style = {[styles.action_button, {backgroundColor: Colors.secondary}]} onPress = {() => this.coachEnableDisable()}>
                                    <Text style = {[styles.button_text, {color: Colors.primary}]}>{this.state.user_profile.status == "DISABLE" ? "Approve" : "Disable"}</Text>
                                </TouchableOpacity>
                            }
                                <TouchableOpacity style = {[styles.action_button, {borderColor: Colors.secondary}]} onPress = {() => this.messageSend()}>
                                    <Text style = {[styles.button_text, {color: Colors.secondary}]}>{"Send Message"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style = {[styles.action_button, {backgroundColor: Colors.light_grey}]} onPress = {() => this.props.navigation.goBack()}>
                                    <Text style = {[styles.button_text, {color: Colors.primary}]}>{"Back"}</Text>
                                </TouchableOpacity>
                            </View>
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
                            // initialPage = {0}
                            // page={this.state.current_page}
                            onChangeTab = {(index_obj) => {this.setState({ current_page: index_obj.i})}}
                        >
                            <Information
                                ref="tab_information"
                                tabLabel="INFORMATION"
                                user_profile = {this.state.user_profile}
                                navigation={this.props.navigation}
                            />
                            <Photos
                                ref="tab_photo"
                                tabLabel="PHOTOS"
                                user_photos = {this.state.user_photos}
                                navigation={this.props.navigation}
                            />
                            <Videos
                                ref="tab_video"
                                tabLabel="VIDEOS"
                                user_videos = {this.state.user_videos}
                                navigation={this.props.navigation}
                            />
                        {
                            this.state.user_profile.role == "PLAYER" && this.state.user_role == "ADMIN" &&
                            <Schedules
                                ref="tab_schedule"
                                tabLabel="SCHEDULES"
                                profile_id = {this.state.profile_id}
                                navigation={this.props.navigation}
                            />
                        }
                        {
                            this.state.user_profile.role == "PLAYER" && this.state.user_role == "ADMIN" &&
                            <TranscriptEligibility
                                ref="tab_transcript"
                                tabLabel="TRANSCRIPT & ELIGIBILITY"
                                profile_id = {this.state.profile_id}
                                navigation={this.props.navigation}
                            />
                        }
                        {
                            this.state.user_profile.role == "COACH" && this.state.user_role == "ADMIN" &&
                            <Schedules
                                ref="tab_schedule"
                                tabLabel="CAMP DATES/SEASON SCHEDULE"
                                profile_id = {this.state.profile_id}
                                navigation={this.props.navigation}
                            />
                        }
                        </ScrollableTabView>
                    </View>
                }
                </ScrollView>
            {
                this.state.user_role == "ADMIN" && this.state.current_page == 3 &&
                <View style = {{position: 'absolute', bottom: 20, right: 20, }}>
                    <TouchableOpacity style = {{width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.refs.tab_schedule.openModal(-1)}>
                        <Image style = {{width: 30, height: 30, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/plus.png')}></Image>
                    </TouchableOpacity>
                </View>
            }
            </Container>
        )
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