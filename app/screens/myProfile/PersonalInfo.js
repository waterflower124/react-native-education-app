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

import { Colors } from '../../utils/Colors';
import { stylesGlobal } from '../../Global/stylesGlobal';
import ProgressIndicator from "../../components/ProgressIndicator";
import * as Global from "../../Global/Global";
import WebService from "../../utils/WebService";
import { Constants } from "../../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalDropdown from "../../components/react-native-modal-dropdown/ModalDropdown";

export default class PersonalInfo extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            my_profile: this.props.my_profile,
            states: Constants.states,
        }
    }

    async UNSAFE_componentWillMount() {
        
    }

    openLink(link) {
        Linking.canOpenURL(link).then(supported => {
            if (supported) {
                Linking.openURL(link);
            } else {
                
            }
        });
    }

    render() {
        return (
            <View style = {{flex: 1, width: '100%', paddingHorizontal: 15, paddingBottom: 15}}>
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"Name*"} placeholderTextColor = {Colors.grey}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('name', text)
                        }}
                    >{this.state.my_profile.name}</TextInput>
                </View>
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"Email*"} placeholderTextColor = {Colors.grey}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('email', text)
                        }}
                    >{this.state.my_profile.email}</TextInput>
                </View>
            {
                this.state.my_profile != null && this.state.my_profile.role == "PLAYER" &&
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"NCAA ID"} placeholderTextColor = {Colors.grey}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('ncaa', text)
                        }}
                    >{(this.state.my_profile.ncaa == null || this.state.my_profile.ncaa == "") ? "" : this.state.my_profile.ncaa}</TextInput>
                </View>
            }
            {
                this.state.my_profile != null && this.state.my_profile.role == "COACH" &&
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"Curent School*"} placeholderTextColor = {Colors.grey}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('current_school', text)
                        }}
                    >{(this.state.my_profile.current_school == null || this.state.my_profile.current_school == "") ? "" : this.state.my_profile.current_school}</TextInput>
                </View>
            }
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"City"} placeholderTextColor = {Colors.grey}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('city', text)
                        }}
                    >{(this.state.my_profile.city == null || this.state.my_profile.city == "") ? "" : this.state.my_profile.city}</TextInput>
                </View>
                <ModalDropdown 
                    dropdownStyle = {{width: '100%', height: 40 * 8, backgroundColor: '#e0e0e0'}}
                    defaultIndex = {0}
                    options = {this.state.states}
                    onSelect = {(index) => {
                        this.props.modifyProfile('state', this.state.states[index].label)
                    }}
                    renderButton = {() => {
                        return (
                            <View style = {[styles.component_view, {flexDirection: 'row',  alignItems: 'center', }]}>
                                <Text style = {[styles.filter_item_text]}>{(this.state.my_profile.state == null || this.state.my_profile.state == "") ? "State" : this.state.my_profile.state}</Text>
                                <View style = {{flex: 1, alignItems: 'flex-end', justifyContent: 'center',}}>
                                    <Image style = {styles.filter_item_dropdown_icon} resizeMode = {'contain'} source={require('../../assets/images/dropdown_triangle.png')}/>
                                </View>
                            </View>
                        )
                    }}
                    renderRow = {(item, index, highlighted) => {
                        return (
                            <View key = {index} style = {styles.filter_item_list_item_view}>
                                <Text style = {styles.filter_item_list_text}>{item.label}</Text>
                            </View>
                        )
                    }}
                />
            {
                this.state.my_profile != null && this.state.my_profile.role == "PLAYER" &&
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"Zip*"} placeholderTextColor = {Colors.grey}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('zip', text)
                        }}
                    >{(this.state.my_profile.zip == null || this.state.my_profile.zip == "") ? "" : this.state.my_profile.zip}</TextInput>
                </View>
            }
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"Twitter"} placeholderTextColor = {Colors.grey}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('twitter', text)
                        }}
                    >{(this.state.my_profile.twitter == null || this.state.my_profile.twitter == "") ? "" : this.state.my_profile.twitter}</TextInput>
                </View>
                <View style = {[styles.component_view, {height: 100}]}>
                    <TextInput style = {styles.text_input} placeholder = {"Description"} placeholderTextColor = {Colors.grey} multiline = {true}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('description', text)
                        }}
                    >{(this.state.my_profile.description == null || this.state.my_profile.description == "") ? "" : this.state.my_profile.description}</TextInput>
                </View>
            </View>
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
    filter_item_container: {
        width: '100%', 
        height: 40, 
        paddingHorizontal: 15
    },
    filter_item_view: {
        width: '100%', 
        height: '100%', 
        flexDirection: 'row', 
        alignItems: 'center', 
    },
    filter_item_text: {
        fontSize: 16, 
        color: Colors.primary
    },
    filter_item_list_text: {
        fontSize: 16, 
        color: Colors.primary,
        marginStart: 10
    },
    filter_item_dropdown_icon: {
        width: 15, 
        height: 15, 
        tintColor: Colors.black
    },
    filter_item_list_item_view: {
        width: '100%', 
        height: 40, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingStart: 10, 
        backgroundColor: Colors.transparent
    },
    filter_action_button: {
        paddingHorizontal: 15, 
        paddingVertical: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary
    },
    filter_action_button_text: {
        fontSize: 16,
        color: Colors.white
    },
})