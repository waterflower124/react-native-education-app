import React, { Component } from "react";
import { View,
    ActivityIndicator
 } from "react-native";
import { Colors } from "../utils/Colors";

export default class ProgressIndicator extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            
        }
    }

    render() {
        return (
            <View style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', zIndex: 100, elevation: 100}}>
                <ActivityIndicator color = {Colors.grey} size="large" />
            </View>
        )
    }
}