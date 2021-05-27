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
import { buyPromotedProductIOS } from "react-native-iap";

export default class PlayerCard extends Component {

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
                            this.props.data.is_top == 1 && this.props.type == "Recruits" &&
                            <Image style = {{width: 40, height: 40, resizeMode: 'contain', tintColor: Colors.secondary}} source = {require('../assets/images/player_recruiter.png')}></Image>
                        }
                        {
                            (this.props.type == "Players" || this.props.type == "Coaches") && this.props.data.status == "DISABLE" && this.state.user_role == "ADMIN" &&
                            <View style = {{paddingVertical: 5, paddingHorizontal: 5, backgroundColor: Colors.grey, borderRadius: 5}}>
                                <Text style = {{fontSize: 14, color: Colors.white}}>{"NO MEMBER"}</Text>
                            </View>
                        }
                        {
                            this.props.type == "Coaches" && this.props.data.status == "ACTIVE" && this.state.user_role == "ADMIN" &&
                            <View style = {{paddingVertical: 5, paddingHorizontal: 5, backgroundColor: Colors.secondary, borderRadius: 5}}>
                                <Text style = {{fontSize: 14, color: Colors.primary}}>{"APPROVED"}</Text>
                            </View>
                        }
                        {
                            this.props.type == "Players" && this.props.data.status == "ACTIVE" && this.state.user_role == "ADMIN" &&
                            <View style = {{flexDirection: 'row', alignItems: 'center'}}>
                                <Switch
                                    trackColor={{ false: Colors.grey, true: Colors.light_secondary }}
                                    thumbColor={this.props.data.is_top == 1 ? Colors.secondary : Colors.light_grey}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() => this.props.recruitChange(this.props.data)}
                                    value={this.props.data.is_top == 1 ? true : false}
                                />
                                <Text style = {{fontSize: 14, color: Colors.grey, marginStart: 10}}>{"RECRUIT"}</Text>
                            </View>
                        }
                        {
                            (this.props.type == "Players" || this.props.type == "Coaches") && this.state.user_role == "ADMIN" &&
                            <TouchableOpacity style = {{padding: 5}} onPress = {() => this.props.deleteUser(this.props.data)}>
                                <Image style = {{width: 30, height: 30, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/delete.png')}></Image>
                            </TouchableOpacity>
                        }
                        {
                            this.props.type == "Players" && this.state.user_role == "COACH" &&
                            <View style = {{flex: 1, alignItems: 'flex-end'}}>
                                <TouchableOpacity style = {{padding: 5}} onPress = {() => this.props.favoriteUser(this.props.data)}>
                                    <Image style = {{width: 30, height: 30, resizeMode: 'contain', tintColor: this.props.data.favorite == 1 ? Colors.red : Colors.grey}} source = {this.props.data.favorite == 1 ? require('../assets/images/heart_full.png') : require('../assets/images/heart.png')}></Image>
                                </TouchableOpacity>
                            </View>
                        }
                        {
                            this.props.type == "Recruits" && this.props.data.status == "ACTIVE" && this.props.data.is_top == 1 && this.props.data.rank_num != null &&
                            <View style = {{alignItems: 'center'}}>
                                <Text style = {{fontSize: 38, color: Colors.white, fontWeight: 'bold'}}>{this.props.data.rank_num}</Text>
                                <Text style = {{fontSize: 24, color: Colors.white}}>{"Rank"}</Text>
                            </View>
                        }
                        </View>
                    {
                        this.props.type == "Players" && this.props.data.status == "ACTIVE" && this.props.data.is_top == 1 && this.state.user_role == "ADMIN" &&
                        <View style = {{position: 'absolute', top: 50, left: 0}}>
                            <ModalDropdown 
                                dropdownStyle = {{width: 100, height: this.props.ranking_list.length * 30}}
                                defaultIndex = {0}
                                options = {this.props.ranking_list}
                                onSelect = {(index) => {
                                    if(this.props.ranking_list[index].user_id == null) {
                                        this.props.setRanking(this.props.data, this.props.ranking_list[index].rank_num)
                                    }
                                }}
                                renderButton = {() => {
                                    return (
                                        <View style = {{width: 100, height: 30, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,}}>
                                            <Text style = {{fontSize: 16, color: Colors.primary, marginStart: 10}}>{this.props.data.rank_num == null ? "Rank" : "Rank " + this.props.data.rank_num}</Text>
                                            <View style = {{flex: 1, alignItems: 'flex-end', justifyContent: 'center', paddingEnd: 15}}>
                                                <Image style = {{width: 15, height: 15, tintColor: Colors.black}} resizeMode = {'contain'} source={require('../assets/images/dropdown_triangle.png')}/>
                                            </View>
                                        </View>
                                    )
                                }}
                                renderRow = {(item, index, highlighted) => {
                                    return (
                                        <View key = {index} style = {[{width: 100, height: 30, flexDirection: 'row', alignItems: 'center', paddingStart: 10, backgroundColor: item.user_id != null ? Colors.grey : null}]}>
                                            <Text style = {{fontSize: 16, color: Colors.primary, marginStart: 10}}>{"Rank " + item.rank_num}</Text>
                                        </View>
                                    )
                                }}
                            />
                        </View>
                    }
                        <View style = {{marginVertical: 10}}>
                        {
                            this.props.type != "Recruits" && this.props.data.status == "ACTIVE" && this.props.data.is_top == 1 &&
                            <Text style = {{fontSize: 32, color: Colors.white}}>{this.props.data.rank_num == null ? "" : "Rank " + this.props.data.rank_num}</Text>
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
                            <TouchableOpacity style = {[styles.button_view]} onPress = {() => this.props.navigation.navigate("PlayerCoachDetailScreen", {profile_id: this.props.data.id})}>
                                <Text style = {[styles.feature_text, {color: Colors.secondary}]}>{"VIEW"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                {
                    this.props.data.role == "PLAYER" &&
                    <View style = {{width: '100%', borderTopColor: Colors.grey, borderTopWidth: 1, paddingTop: 20, marginTop: 10}}>
                        <Text style = {styles.feature_text}>{"City: "}{this.props.data.city == null ? "" : this.props.data.city}</Text>
                        <Text style = {styles.feature_text}>{"State: "}{this.props.data.state == null ? "" : this.props.data.state}</Text>
                        <Text style = {styles.feature_text}>{"Height: "}{this.props.data.height == null ? "" : this.props.data.height}{"  Weight: "}{this.props.data.weight == null ? "" : this.props.data.weight}</Text>
                    </View>
                }
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