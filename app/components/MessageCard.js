import React, { Component } from "react";
import { 
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ImageBackground,
    Linking
 } from "react-native";
import { Colors } from "../utils/Colors";
import * as Global from "../Global/Global";
import moment from 'moment';

export default class MessageCard extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            
        }
    }


    render() {
        const opponent = this.props.data.type == 0 ? this.props.data.sender : this.props.data.receiver
        return (
            <TouchableOpacity style = {{width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.light_grey, 
                borderStartWidth: (this.props.data.delete_check || (this.props.data.type == 0 && this.props.data.status == 0)) ? 2 : 0, borderStartColor: this.props.data.delete_check ? Colors.primary : "#1ca5ff"}}
                onPress = {() => this.props.messageDetail(this.props.data)}
            >
                <TouchableOpacity style = {{width: 40, aspectRatio: 1, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.props.selectMessage(this.props.data)}>
                {
                    this.props.data.delete_check &&
                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.secondary}} source = {require('../assets/images/message_check.png')}></Image>
                }
                {
                    !this.props.data.delete_check &&
                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/message_uncheck.png')}></Image>
                }    
                </TouchableOpacity>
                <View style = {{flex: 1, paddingHorizontal: 10}}>
                    <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center'}}>
                        <View style = {{width: 40, aspectRatio: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.grey, alignItems: 'center', justifyContent: 'center'}}>
                        {
                            opponent.avatar != null && opponent.avatar != "" &&
                            <Image style = {{width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 20, overflow: 'hidden'}} source = {{uri: Global.BASE_URL + opponent.avatar}}></Image>
                        }
                        {
                            !(opponent.avatar != null && opponent.avatar != "") &&
                            <Text style = {{fontSize: 32, color: Colors.white}}>{opponent.name != null ? opponent.name.charAt(0).toUpperCase() : ""}</Text>
                        }
                        </View>
                        <View style = {{flex: 1, justifyContent: 'space-around', marginStart: 10}}>
                            <Text style = {{fontSize: 16, color: Colors.primary}}>{opponent.name}</Text>
                            <Text style = {{fontSize: 16, color: Colors.grey}}>{moment(this.props.data.date).format("yyyy-MM-DD hh:mm:ss")}</Text>
                        </View>
                    </View>
                    <Text style = {{width: '100%', fontSize: 14, color: Colors.grey, marginTop: 5}} numberOfLines = {1}>{this.props.data.message}</Text>
                </View>
            {
                this.props.data.type == 0 &&
                <TouchableOpacity style = {{width: 40, aspectRatio: 1, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.props.messageReply(opponent)}>
                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/message_reply.png')}></Image>
                </TouchableOpacity>
            }
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    title_text: {
        fontSize: 20,
        color: Colors.black,
    },
    button_text: {
        fontSize: 18,
        color: Colors.secondary,
    }
})