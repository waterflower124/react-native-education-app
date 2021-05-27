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
import moment from 'moment';

var TAG = "HomeScreen";

export default class HomeScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            recruits_array: [],
            games_array: [],
            schedules_array: [],
            news_array: [],

            message_send_popup: false,
            message_send_item: null,
            send_message: ""
        }
    }

    async UNSAFE_componentWillMount() {
        this.getDashboardData();
    }

    getDashboardData = async() => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/dashboard/analytics";
                                                
            console.log(TAG + " callDashboardDataAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleDashboardDataAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleDashboardDataAPI = async(response, isError) => {
        console.log(TAG + " callDashboardDataAPI Response " + JSON.stringify(response));
        console.log(TAG + " callDashboardDataAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    if(response.recruits != null) {
                        this.setState({
                            recruits_array: response.recruits
                        })
                    }
                    if(response.recruits != null) {
                        this.setState({
                            games_array: response.games
                        })
                    }
                    if(response.recruits != null) {
                        this.setState({
                            schedules_array: response.schedules
                        })
                    }
                    if(response.recruits != null) {
                        this.setState({
                            news_array: response.sponsorships
                        })
                    }
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

    openNews(item) {
        Linking.canOpenURL(item.description).then(supported => {
            if (supported) {
                Linking.openURL(item.description);
            } else {
                
            }
        });
    }

    messageSend = async(item) => {
        this.setState({
            message_send_item: item,
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
                                                
            console.log(TAG + " callSendRecruitsMessageAPI uri " + uri);
            let params = JSON.stringify({
                receivers: [this.state.message_send_item.id], 
                message: this.state.send_message
            })

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
                    Alert.alert("Message sent sccuessfully", "");
                    this.setState({
                        message_send_popup: false,
                        send_message: ''
                    })
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
            <Container style = {{flex: 1}} navigation = {this.props.navigation}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
            {
                this.state.message_send_popup &&
                <View style = {{width: '100%', height: '100%', position: 'absolute', zIndex: 10, elevation: 10, alignItems: 'center', justifyContent: 'center'}}>
                    <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.black, opacity: 0.3}}></View>
                    <View style = {{width: '90%', backgroundColor: Colors.white, borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10}}>
                        <Text style = {{fontSize: 16, color: Colors.black}}>{"To " + this.state.message_send_item.name}</Text>
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
                <View style = {{flex: 1, alignItems: 'center',}}>
                    <ScrollView style = {{width: '100%'}}>
                    {
                        this.state.news_array.map((item, index) => 
                        <View key = {index} style = {{width: '100%', paddingHorizontal: 15}}>
                            <TouchableOpacity style = {{width: '100%', aspectRatio: 1, backgroundColor: Colors.white, marginTop: 15}} onPress = {() => this.openNews(item)}>
                                <Image style = {{width: '100%', height: '100%', resizeMode: 'cover'}} source = {{uri: Global.BASE_URL + item.image}}></Image>
                            </TouchableOpacity>
                        </View>
                        )
                    }
                        <View style = {styles.section_title_bar}>
                            <Text style = {styles.section_title_text}>{"TopTenRecruits"}</Text>
                        </View>
                    {
                        this.state.recruits_array.length > 0 && this.state.recruits_array.map((item, index) => 
                        <PlayerCoachCard key = {index} style = {{marginTop: 15}} data = {item} navigation = {this.props.navigation} messageSend = {this.messageSend} type = {"Recruits"}/>
                        )
                    }
                    {
                        this.state.recruits_array.length == 0 && 
                        <Text style = {[styles.section_title_text, {color: Colors.black, textAlign: 'center', marginVertical: 20}]}>{"There are no Top Recruits"}</Text>
                    }
                        <View style = {styles.section_title_bar}>
                            <Text style = {styles.section_title_text}>{"Game of the Week"}</Text>
                        </View>
                    {
                        this.state.games_array.length > 0 && this.state.games_array.map((item, index) => 
                        <GameCard key = {index} data = {item} navigation = {this.props.navigation} style = {{marginTop: 15}}/>
                        )
                    }
                    {
                        this.state.games_array.length == 0 && 
                        <Text style = {[styles.section_title_text, {color: Colors.black, textAlign: 'center', marginVertical: 20}]}>{"There are no Games"}</Text>
                    }
                        <View style = {styles.section_title_bar}>
                            <Text style = {styles.section_title_text}>{"Schedules"}</Text>
                        </View>
                    {
                        this.state.schedules_array.length > 0 && this.state.schedules_array.map((item, index) => 
                        <ScheduleCard key = {index} data = {item} navigation = {this.props.navigation} style = {{marginTop: 15}}/>
                        )
                    }
                    {
                        this.state.schedules_array.length == 0 && 
                        <Text style = {[styles.section_title_text, {color: Colors.black, textAlign: 'center', marginVertical: 20}]}>{"There are no Schedules"}</Text>
                    }
                    </ScrollView>
                </View>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    section_title_bar: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: Colors.primary,
        marginTop: 15
    },
    section_title_text: {
        fontSize: 18,
        color: Colors.white
    },
    title_text: {
        fontSize: 20,
        color: Colors.black,
    },
    location_text: {
        fontSize: 14,
        color: Colors.grey,
        marginTop: 5
    },
    date_text: {
        fontSize: 16,
        color: Colors.date_color,
        marginTop: 5
    },
    description_text: {
        width: '100%',
        fontSize: 18,
        color: Colors.black,
        marginTop: 15
    }
})