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

export default class GameCard extends Component {

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
                        <Text style = {styles.title_text}>{this.props.data.title}</Text>
                    {
                        this.state.user_role == "ADMIN" && this.props.type == "games_screen" &&
                        <View style = {{flexDirection: 'row', alignItems: 'center'}}>
                            <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginStart: 10}} onPress = {() => this.props.editGame(this.props.data)}>
                                <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/edit.png')}></Image>
                            </TouchableOpacity>
                            <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginStart: 10}} onPress = {() => this.props.deleteGame(this.props.data)}>
                                <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/delete.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    }
                    </View>
                    <Image style = {{width: '100%', aspectRatio: 1, resizeMode: 'cover'}} source = {{uri: Global.BASE_URL + this.props.data.image}}></Image>
                    <View style = {{width: '100%', position: 'absolute', bottom: 20, left: 0, alignItems: 'center'}}>
                        <TouchableOpacity style = {{paddingHorizontal: 30, height: 40, justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 20}} onPress = {() => this.openLink()}>
                            <Text style = {styles.button_text}>{"VIEW"}</Text>
                        </TouchableOpacity>
                    </View>
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