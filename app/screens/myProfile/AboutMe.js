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

export default class AboutMe extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            my_profile: this.props.my_profile,
            position: Constants.positions,
        }

        // {
        //     "profile": {
        //       "id": 114,
        //       "user_id": 114,
        //       "ncaa": null,
        //       "city": null,
        //       "state": null,
        //       "zipcode": null,
        //       "twitter": null,
        //       "description": null,
        //       "current_school": null,
        //       "year": null,
        //       "position": null,
        //       "height": null,
        //       "weight": null,
        //       "hs_college": null,
        //       "act": null,
        //       "sat": null,
        //       "hs_gpa": null,
        //       "college_gpa": null,
        //       "created_at": "2021-03-31T19:38:01.000Z",
        //       "updated_at": "2021-03-31T19:38:01.000Z",
        //       "email": "Test@email.com",
        //       "name": "Test user",
        //       "avatar": null,
        //       "role": "PLAYER",
        //       "status": "DISABLE",
        //       "is_top": 0,
        //       "member": null
        //     },
        //     "resources": [
              
        //     ]
        // }
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
                    <TextInput style = {styles.text_input} placeholder = {"Year*"}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('year', text)
                        }}
                    >{this.state.my_profile.year == null ? "" : this.state.my_profile.year}</TextInput>
                </View>
                <ModalDropdown 
                    dropdownStyle = {{width: '100%', height: 40 * 8, backgroundColor: '#e0e0e0'}}
                    defaultIndex = {0}
                    options = {this.state.position}
                    onSelect = {(index) => {
                        this.props.modifyProfile('position', this.state.position[index].label)
                    }}
                    renderButton = {() => {
                        return (
                            <View style = {[styles.component_view, {flexDirection: 'row',  alignItems: 'center', }]}>
                                <Text style = {[styles.filter_item_text, {color: (this.state.my_profile.position == null || this.state.my_profile.position == "") ? Colors.grey : Colors.primary}]}>{(this.state.my_profile.position == null || this.state.my_profile.position == "") ? "Position" : this.state.my_profile.position}</Text>
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
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"Height"}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('height', text)
                        }}
                    >{(this.state.my_profile.height == null || this.state.my_profile.height == "") ? "" : this.state.my_profile.height}</TextInput>
                </View>
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"Weight"}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('weight', text)
                        }}
                    >{(this.state.my_profile.weight == null || this.state.my_profile.weight == "") ? "" : this.state.my_profile.weight}</TextInput>
                </View>
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"HS/College*"}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('hs_college', text)
                        }}
                    >{(this.state.my_profile.hs_college == null || this.state.my_profile.hs_college == "") ? "" : this.state.my_profile.hs_college}</TextInput>
                </View>
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"ACT"}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('act', text)
                        }}
                    >{(this.state.my_profile.act == null || this.state.my_profile.act == "") ? "" : this.state.my_profile.act}</TextInput>
                </View>
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"SAT"}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('sat', text)
                        }}
                    >{(this.state.my_profile.sat == null || this.state.my_profile.sat == "") ? "" : this.state.my_profile.sat}</TextInput>
                </View>
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"H.S.GPA"}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('hs_gpa', text)
                        }}
                    >{(this.state.my_profile.hs_gpa == null || this.state.my_profile.hs_gpa == "") ? "" : this.state.my_profile.hs_gpa}</TextInput>
                </View>
                <View style = {styles.component_view}>
                    <TextInput style = {styles.text_input} placeholder = {"College GPA"}
                        onChangeText = {(text) => {
                            this.props.modifyProfile('college_gpa', text)
                        }}
                    >{(this.state.my_profile.college_gpa == null || this.state.my_profile.college_gpa == "") ? "" : this.state.my_profile.college_gpa}</TextInput>
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