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

export default class Information extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            user_profile: this.props.user_profile,

        }

        this.onEndReachedCalledDuringMomentum = true;
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
                <View style = {styles.card_view}>
                    <View style = {styles.title_view}>
                        <Text style = {styles.title_text}>{"General Information"}</Text>
                    </View>
                    <View style = {styles.contents_view}>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Name"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.name}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Email"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.email}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"NCAA ID"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.ncaa == null ? "---" : this.state.user_profile.ncaa}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"City"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.city == null ? "---" : this.state.user_profile.city}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"State"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.state == null ? "---" : this.state.user_profile.state}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Zip Code"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.zipcode == null ? "---" : this.state.user_profile.zipcode}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Twitter"}</Text>
                            <Text style = {[styles.item_contents, {color: 'blue'}]} onPress = {() => this.openLink(this.state.user_profile.twitter)}>{this.state.user_profile.twitter == null ? "---" : this.state.user_profile.twitter}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Description"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.description == null ? "---" : this.state.user_profile.description}</Text>
                        </View>
                    </View>
                </View>
                <View style = {styles.card_view}>
                    <View style = {styles.title_view}>
                        <Text style = {styles.title_text}>{"About me"}</Text>
                    </View>
                    <View style = {styles.contents_view}>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Current School"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.current_school == null ? "---" : this.state.user_profile.current_school}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Year"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.year == null ? "---" : this.state.user_profile.year}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Position"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.position == null ? "---" : this.state.user_profile.position}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Height"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.height == null ? "---" : this.state.user_profile.height}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"Weight"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.weight == null ? "---" : this.state.user_profile.weight}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"HS/College"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.hs_college == null ? "---" : this.state.user_profile.hs_college}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"ACT"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.act == null ? "---" : this.state.user_profile.act}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"SAT"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.sat == null ? "---" : this.state.user_profile.sat}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"H.S. GPA"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.hs_gpa == null ? "---" : this.state.user_profile.hs_gpa}</Text>
                        </View>
                        <View style = {styles.item_view}>
                            <Text style = {styles.item_title}>{"College GPA"}</Text>
                            <Text style = {styles.item_contents}>{this.state.user_profile.college_gpa == null ? "---" : this.state.user_profile.college_gpa}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    card_view: {
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 15
    },
    title_view: {
        width: '100%',
        height: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        paddingHorizontal: 30
    },
    title_text: {
        fontSize: 16,
        color: Colors.white
    },
    contents_view: {
        width: '100%',
        paddingHorizontal: 25,
        backgroundColor: Colors.white,
        paddingBottom: 25
    },
    item_view: {
        width: '100%',
        marginTop: 15
    },
    item_title: {
        fontSize: 14,
        color: Colors.primary
    },
    item_contents: {
        fontSize: 14,
        color: Colors.grey,
        marginTop: 5
    }
})