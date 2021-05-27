import React, { Component } from "react";
import { 
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Switch
 } from "react-native";
import { Colors } from "../utils/Colors";
import * as Global from "../Global/Global";
import ModalDropdown from "./react-native-modal-dropdown/ModalDropdown";
import { Constants } from "../Global/Constants";

export default class CoachCard extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            recruits_rank_array: Constants.recruits_rank_array
        }
    }

    UNSAFE_componentWillMount() {

    }

    render() {
        return (
            <View style = {{width: '100%', paddingHorizontal: 15}}>
                <View style={[{width: '100%', borderRadius: 10, backgroundColor: Colors.primary, paddingHorizontal: 15, paddingVertical: 20}, this.props.style]}>
                    <View style = {{width: '100%', alignItems: 'center'}}>
                        <View style = {{width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10, elevation: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        {
                            this.props.data.status == "DISABLE" &&
                            <View style = {{paddingVertical: 5, paddingHorizontal: 5, backgroundColor: Colors.grey, borderRadius: 5}}>
                                <Text style = {{fontSize: 14, color: Colors.white}}>{"NO MEMBER"}</Text>
                            </View>
                        }
                        {
                            this.props.data.status == "ACTIVE" &&
                            <View style = {{paddingVertical: 5, paddingHorizontal: 5, backgroundColor: Colors.secondary, borderRadius: 5}}>
                                <Text style = {{fontSize: 14, color: Colors.primary}}>{"APPROVED"}</Text>
                            </View>
                        }
                        {
                            <TouchableOpacity style = {{padding: 5}}>
                                <Image style = {{width: 30, height: 30, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/delete.png')}></Image>
                            </TouchableOpacity>
                        }
                        </View>
                        <View style = {{width: 120, aspectRatio: 1, borderRadius: 60, borderColor: Colors.white, borderWidth: 2, marginVertical: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.grey}}>
                        {
                            this.props.data.avatar != null && this.props.data.avatar != "" && 
                            <Image style = {{width: '100%', height: '100%', resizeMode: 'cover'}} source = {{uri: Global.BASE_URL + this.props.data.avatar}}></Image>
                        }
                        {
                            !(this.props.data.avatar != null && this.props.data.avatar != "") && 
                            <Text style = {{fontSize: 56, color: Colors.white}}>{this.props.data.name.charAt(0).toUpperCase()}</Text>
                        }   
                        </View>
                        <View style = {{width: '100%', marginVertical: 5, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style = {styles.name_text}>{this.props.data.name}</Text>
                        {
                            this.props.data.role == "COACH" &&
                            <Text style = {styles.feature_text}>{this.props.data.current_school == null ? "()" : "(" + this.props.data.current_school + ")"}</Text>
                        }
                        {
                            this.props.data.role == "PLAYER" &&
                            <Text style = {styles.feature_text}>{this.props.data.position == null ? "()" : "(" + this.props.data.position + ")"}</Text>
                        }   
                        </View>
                        <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                            <TouchableOpacity style = {[styles.button_view, {backgroundColor: Colors.secondary}]} onPress = {() => this.props.messageSend(this.props.data)}>
                                <Text style = {[styles.feature_text, {color: Colors.black}]}>{"MESSAGE"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {[styles.button_view]}>
                                <Text style = {[styles.feature_text, {color: Colors.secondary}]}>{"VIEW"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style = {{width: '100%', borderTopColor: Colors.grey, borderTopWidth: 1, paddingTop: 20, marginTop: 10}}>
                        <Text style = {styles.feature_text}>{"City: "}{this.props.data.city == null ? "" : this.props.data.city}</Text>
                        <Text style = {styles.feature_text}>{"State: "}{this.props.data.state == null ? "" : this.props.data.state}</Text>
                        <Text style = {styles.feature_text}>{"Height: "}{this.props.data.height == null ? "" : this.props.data.height}{"  Weight: "}{this.props.data.weight == null ? "" : this.props.data.weight}</Text>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    name_text: {
        fontSize: 18,
        color: Colors.white,
    },
    button_view: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderColor: Colors.secondary,
        borderWidth: 1,
        borderRadius: 5
    },
    feature_text: {
        fontSize: 16,
        color: Colors.white,
        marginVertical: 5
    }
})