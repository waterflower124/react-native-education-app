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

export default class ScheduleCard extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
        }
    }

    openLink() {
        Linking.canOpenURL(this.props.data.link).then(supported => {
            if (supported) {
                Linking.openURL(this.props.data.link);
            } else {
                
            }
        });
    }

    render() {
        return (
            <View style = {{width: '100%', paddingHorizontal: 15}}>
                <TouchableOpacity style={[{width: '100%', flexDirection: 'row', borderRadius: 10, backgroundColor: Colors.white, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 15}, this.props.style]} onPress = {() => this.openLink()}>
                    <View style = {{flex: 1}}>
                        <Text style = {styles.title_text}>{this.props.data.title}</Text>
                        <Text style = {styles.location_text}>{this.props.data.location}</Text>
                        <Text style = {styles.date_text}>{moment(this.props.data.date).format("MMM DD. yyyy h:mm a")}</Text>
                        <Text style = {styles.description_text} multiline = {true}>{this.props.data.desc}</Text>
                    </View>
                {
                    this.state.user_role == "ADMIN" &&
                    <View style = {{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.props.openModal(this.props.data)}>
                            <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.secondary}} source = {require('../assets/images/edit.png')}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginStart: 10}} onPress = {() => this.props.deleteSchedule(this.props.data)}>
                            <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/delete.png')}></Image>
                        </TouchableOpacity>
                    </View>
                }
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
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