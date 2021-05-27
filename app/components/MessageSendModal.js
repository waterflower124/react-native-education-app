import React, { Component } from "react";
import { View,
    ActivityIndicator
 } from "react-native";
import { Colors } from "../utils/Colors";

export default class MessageSendModal extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            send_message: ""
        }
    }

    render() {
        return (
            <View style = {{width: '100%', height: '100%', position: 'absolute', zIndex: 10, elevation: 10, alignItems: 'center', justifyContent: 'center'}}>
                <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.black, opacity: 0.3}}></View>
                <View style = {{width: '90%', backgroundColor: Colors.white, borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10}}>
                    <Text style = {{fontSize: 16, color: Colors.black}}>{"To " + this.props.message_send_item.name}</Text>
                    <TextInput style = {{width: '100%', height: 100, marginVertical: 15, padding: 15, color: Colors.black, fontSize: 14, borderColor: Colors.grey, borderWidth: 1, borderRadius: 5}} placeholder = {"Message"} placeholderTextColor = {Colors.grey} multiline = {true} onChangeText = {(text) => this.setState({send_message: text})}>{this.state.send_message}</TextInput>
                    <View style = {{width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: Colors.black, borderRadius: 5, backgroundColor: Colors.black}} onPress = {() => this.props.sendRecruitsMessage()}>
                            <Text style = {{fontSize: 16, color: Colors.white}}>{"SEND"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: Colors.black, borderRadius: 5, marginStart: 10}} onPress = {() => this.props.cancelRecruitsMessage()}>
                            <Text style = {{fontSize: 16, color: Colors.black}}>{"CANCEL"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}