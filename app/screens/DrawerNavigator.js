
import React, { Component } from "react";
import {
    View,
    Text
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import SideMenu from "../components/SideMenu";
import HomeScreen from "./HomeScreen";
import PlayersScreen from "./PlayersScreen";
import CoachesScreen from "./CoachesScreen";
import MessagesScreen from "./MessagesScreen";
import NewsScreen from "./NewsScreen";
import PlayerCoachDetailScreen from "./PlayerCoachDetailScreen";
import GamesScreen from "./GamesScreen";
import SchedulesScreen from "./SchedulesScreen";
import SponsorshipScreen from "./SponsorshipScreen";
import SettingsScreen from "./SettingsScreen";
import MembershipScreen from "./MembershipScreen";
import MyProfileScreen from "./MyProfileScreen";
import RecruitingBoardScreen from "./RecruitingBoardScreen";


const Drawer = createDrawerNavigator();

export default class DrawerNavigator extends Component {

    constructor(props) {
        super(props);
        
    }

    UNSAFE_componentWillMount() {
       
    }
  
    render() {
        return (
            <Drawer.Navigator initialRouteName="HomeScreen" drawerContent = {(props) => <SideMenu {...props} />} drawerPosition =  {"left"} drawerStyle = {{drawerBackgroundColor: "transparent", width: "70%"}}>
                <Drawer.Screen name = "HomeScreen" component = {HomeScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "PlayersScreen" component = {PlayersScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "CoachesScreen" component = {CoachesScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "MessagesScreen" component = {MessagesScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "NewsScreen" component = {NewsScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "PlayerCoachDetailScreen" component = {PlayerCoachDetailScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "GamesScreen" component = {GamesScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "SchedulesScreen" component = {SchedulesScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "SponsorshipScreen" component = {SponsorshipScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "SettingsScreen" component = {SettingsScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "MembershipScreen" component = {MembershipScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "MyProfileScreen" component = {MyProfileScreen} options={{unmountOnBlur:true}}/>
                <Drawer.Screen name = "RecruitingBoardScreen" component = {RecruitingBoardScreen} options={{unmountOnBlur:true}}/>
            </Drawer.Navigator>
        );
    }
}