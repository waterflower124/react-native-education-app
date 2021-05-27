import React, { Component } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  I18nManager
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../utils/Colors'
import { stylesGlobal } from '../Global/stylesGlobal';
// import { EventRegister } from 'react-native-event-listeners';
import { Constants } from "../Global/Constants";
import * as Global from "../Global/Global";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';


export default class SideMenu extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            user_full_name: Global.FULLNAME,
            user_avatar: Global.AVATAR,
            user_email: Global.USER_EMAIL,
            selected_menu: 'HomeScreen',
            main_menu: [
                {
                    screen: "HomeScreen",
                    name: "Home",
                    icon: require("../assets/images/home.png")
                },
                {
                    screen: "CoachesScreen",
                    name: "Coaches",
                    icon: require("../assets/images/coach.png")
                },
                {
                    screen: "PlayersScreen",
                    name: "Players",
                    icon: require("../assets/images/player.png")
                },
                {
                    screen: "MessagesScreen",
                    name: "Messages",
                    icon: require("../assets/images/user_email.png")
                },
                {
                    screen: "MembershipScreen",
                    name: "Membership",
                    icon: require("../assets/images/membership.png")
                },
                {
                    screen: "RecruitingBoardScreen",
                    name: "Recruiting Board",
                    icon: require("../assets/images/heart.png")
                },
                {
                    screen: "NewsScreen",
                    name: "News",
                    icon: require("../assets/images/news.png")
                }
            ],
            manage_menu: [
                {
                    screen: "GamesScreen",
                    name: "Games",
                    icon: require("../assets/images/games.png")
                },
                {
                    screen: "SchedulesScreen",
                    name: "Schedules",
                    icon: require("../assets/images/schedule.png")
                },
                {
                    screen: "SponsorshipScreen",
                    name: "Sponsorship ads",
                    icon: require("../assets/images/sponsorship.png")
                }
            ]
        }
    }

    async UNSAFE_componentWillMount() {
        var main_menu = this.state.main_menu;
        for(var i = 0; i < main_menu.length; i ++) {
            if((this.state.user_role == "ADMIN" || this.state.user_role == "COACH") && main_menu[i].screen == "MembershipScreen") {
                main_menu.splice(i, 1);
            }
            if((this.state.user_role == "ADMIN" || this.state.user_role == "PLAYER") && main_menu[i].screen == "RecruitingBoardScreen") {
                main_menu.splice(i, 1);
            }
        }
        this.setState({
            main_menu: main_menu
        })
        this.profileChangeListener = EventRegister.addEventListener(Constants.PROFILE_CHANGED, async() => {
            this.setState({
                user_avatar: Global.AVATAR,
                user_full_name: Global.FULLNAME,
                user_email: Global.USER_EMAIL,
            })
        })
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.side_menu_color }}>
                <View style = {{width: '100%'}}>
                    <View style = {{width: '100%', backgroundColor: Colors.primary}}>
                        <View style = {{width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10}}>
                            <View style = {{height: '100%', aspectRatio: 1.4}}>
                                <Image style = {{width: '100%', height: '100%', resizeMode: 'contain'}} source = {require('../assets/images/logo_splash.png')}></Image>
                            </View>
                            {/* <Text style = {{fontSize: 16, color: Colors.white, marginStart: 10}}>{"PostGrad"}</Text> */}
                            <View style = {{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
                                <TouchableOpacity style = {{height: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.props.navigation.closeDrawer()}>
                                    <Image style = {{width: '30%', height: '30%', resizeMode: 'contain', tintColor: Colors.white}} source = {require('../assets/images/left_arrow.png')}></Image>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style = {{width: '100%', alignItems: 'center', marginTop: 25, marginBottom: 60}}>
                            <Text style = {{fontSize: 16, color: Colors.white}}>{this.state.user_full_name}</Text>
                            <Text style = {{fontSize: 14, color: Colors.grey}}>{this.state.user_email}</Text>
                        </View>
                        <View style = {{width: '100%', height: 50, backgroundColor: Colors.side_menu_color}}></View>
                        <View style = {{width: '100%', height: 50 * 2, position: 'absolute', bottom: 0, alignItems: 'center'}}>
                            <View style = {{height: 50 * 2, aspectRatio: 1, borderRadius: 50, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center'}}>
                                <View style = {{height: 45 * 2, aspectRatio: 1, borderRadius: 45, overflow: 'hidden', backgroundColor: Colors.light_grey}}>
                                {
                                    this.state.user_avatar != null && this.state.user_avatar != "" &&
                                    <Image style = {{width: '100%', height: '100%', resizeMode: 'cover'}} source = {{uri: this.state.user_avatar}}></Image>
                                }
                                {
                                    !(this.state.user_avatar != null && this.state.user_avatar != "") &&
                                    <Image style = {{width: '100%', height: '100%', resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/user_avatar.png')}></Image>
                                }
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                <View style = {{flex: 1, width: '100%', alignItems: "center"}}>
                {
                    this.state.main_menu.map((item, index) => 
                    <View key = {index} style = {{width: '100%', }}>
                        <TouchableOpacity style = {[styles.button_component]} 
                            onPress = {() => {
                                this.props.navigation.closeDrawer();
                                this.setState({selected_menu: item.screen})
                                this.props.navigation.navigate(item.screen);
                            }}
                        >
                            <View style = {[styles.button_view, , {backgroundColor: this.state.selected_menu == item.screen ? Colors.secondary : Colors.transparent}]}>
                                <Image style = {[styles.iconStyle, {tintColor: this.state.selected_menu == item.screen ? Colors.primary : Colors.white }]} source = {item.icon}></Image>
                                <Text style = {[styles.menu_text, {color: this.state.selected_menu == item.screen ? Colors.black : Colors.white}]}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    )
                }
                {
                    this.state.user_role == "ADMIN" &&
                    <View style = {{flex: 1, width: '100%', alignItems: "center"}}>
                        <View style = {{width: '100%', marginVertical: 15}}>
                            <Text style = {[styles.menu_text, {color: Colors.white}]}>{"MANAGEMENT"}</Text>
                        </View>
                    {
                        this.state.manage_menu.map((item, index) => 
                        <View key = {index} style = {{width: '100%'}}>
                        {
                            <TouchableOpacity key = {index} style = {[styles.button_component]} 
                                onPress = {() => {
                                    // this.props.navigation.closeDrawer();
                                    this.setState({selected_menu: item.screen})
                                    this.props.navigation.navigate(item.screen);
                                }}
                            >
                                <View style = {[styles.button_view, {backgroundColor: this.state.selected_menu == item.screen ? Colors.secondary : Colors.transparent}]}>
                                    <Image style = {[styles.iconStyle, {tintColor: this.state.selected_menu == item.screen ? Colors.primary : Colors.white }]} source = {item.icon}></Image>
                                    <Text style = {[styles.menu_text, {color: this.state.selected_menu == item.screen ? Colors.black : Colors.white}]}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        }
                        </View>
                        )
                    }
                    </View>
                }
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    button_component: {
        width: '95%', 
        alignItems: 'center',
        
    },
    button_view: {
        width: '100%',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopEndRadius: 20,
        borderBottomEndRadius: 20,
        paddingHorizontal: 15
    },
    iconStyle: { 
        width: 20, 
        height: 20, 
        resizeMode: 'contain',
        tintColor: Colors.white
    },
    menu_text: {
        fontSize: 14, 
        marginStart: 20
    }
});


