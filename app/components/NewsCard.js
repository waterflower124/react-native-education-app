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

export default class NewsCard extends Component {

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
                <View style={[{width: '100%', borderRadius: 10, paddingHorizontal: 15, backgroundColor: Colors.white, overflow: 'hidden'}, this.props.style]}>
                    <View style = {{width: '100%', flexDirection: 'row', marginVertical: 15}}>
                        <View style = {{width: '100%', flexDirection: 'row'}}>
                            <View style = {{flex: 1}}>
                                <Text style = {styles.title_text}>{this.props.data.title}</Text>
                                <Text style = {styles.date_text}>{moment(this.props.data.created_at).format("MMM DD. yyyy h:mm a")}</Text>
                            </View>
                        {
                            this.state.user_role == "ADMIN" &&
                            <View style = {{flexDirection: 'row', alignItems: 'center'}}>
                                <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginStart: 10}} onPress = {() => this.props.openModal(this.props.data)}>
                                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.secondary}} source = {require('../assets/images/edit.png')}></Image>
                                </TouchableOpacity>
                                <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginStart: 10}} onPress = {() => this.props.deleteNews(this.props.data)}>
                                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/delete.png')}></Image>
                                </TouchableOpacity>
                            </View>
                        }
                        </View>
                    </View>
                    <View style = {{width: '100%', marginTop: 10}}>
                        <Text style = {styles.content_text}>{this.props.data.content}</Text>
                    </View>
                {
                    this.props.data.image != null && this.props.data.image != "" &&
                    <Image style = {{width: '100%', aspectRatio: 1, resizeMode: 'cover', marginVertical: 15}} source = {{uri: Global.BASE_URL + this.props.data.image}}></Image>
                }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    title_text: {
        fontSize: 20,
        color: Colors.black,
        flex: 1,
    },
    date_text: {
        fontSize: 14,
        color: Colors.date_color,
        marginTop: 5
    },
    content_text: {
        fontSize: 16,
        color: Colors.primary,
    },
    button_text: {
        fontSize: 18,
        color: Colors.secondary,
    }
})