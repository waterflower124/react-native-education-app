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

export default class SponsorshipCard extends Component {

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
                <View style={[{width: '100%', borderRadius: 10, backgroundColor: Colors.white, overflow: 'hidden'}, this.props.style]}>
                    <View style = {{width: '100%', paddingHorizontal: 15, flexDirection: 'row', marginVertical: 15}}>
                    {
                        this.state.user_role == "ADMIN" && 
                        <View style = {{width: '100%', alignItems: 'flex-end'}}>
                            <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginStart: 10}} onPress = {() => this.props.deleteSponsorship(this.props.data)}>
                                <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/delete.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    }
                    </View>
                    <Image style = {{width: '100%', aspectRatio: 1, resizeMode: 'contain'}} source = {{uri: Global.BASE_URL + this.props.data.image}}></Image>
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
    button_text: {
        fontSize: 18,
        color: Colors.secondary,
    }
})