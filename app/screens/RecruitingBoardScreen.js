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

import { Colors } from '../utils/Colors';
import { stylesGlobal } from '../Global/stylesGlobal';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ProgressIndicator from "../components/ProgressIndicator";
import * as Global from "../Global/Global";
import WebService from "../utils/WebService";
import { Constants } from "../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Container from '../components/Container';
import PlayerCoachCard from '../components/PlayerCoachCard';
import GameCard from '../components/GameCard';
import ScheduleCard from '../components/ScheduleCard';
import { buildQuery } from '../utils/utils';
import ModalDropdown from "../components/react-native-modal-dropdown/ModalDropdown";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

var TAG = "PlayersScreen";

export default class PlayersScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            loading: false,
            refreshing: false,
            players_array: [],
            page_number: 0,
            limit: 10,
            search_text: '',

            message_send_popup: false,
            message_send_item: null,
            send_message: "",
            more_load: true,

            selected_item: null,

        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        this.getFavoritePlayers();
    }

    getFavoritePlayers = async() => {
        try {
            if(!this.state.refreshing) {
                this.setState({
                    loading: true,
                });
            }
            
            var query = buildQuery({
                role: "PLAYER",
                offset: this.state.page_number,
                limit: this.state.limit,
                search: this.state.search_text,
            });
            
            var uri = Global.BASE_URL + "/api/favorited_profiles" + query;
                                                
            console.log(TAG + " callGetFavoritePlayersAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetFavoritePlayersAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    }

    handleGetFavoritePlayersAPI = async(response, isError) => {
        console.log(TAG + " callGetFavoritePlayersAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetFavoritePlayersAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    for(var i = 0; i < response.profiles.length; i ++) {
                        response.profiles[i].favorite = 1;
                    }
                    if(this.state.refreshing) {
                        this.setState({
                            players_array: response.profiles
                        })
                    } else {
                        this.setState({
                            players_array: [...this.state.players_array, ...response.profiles]
                        })
                    }
                    if(response.isMore) {
                        this.setState({
                            page_number: this.state.page_number + 1,
                            more_load: true
                        })
                    } else {
                        this.setState({
                            more_load: false
                        })
                    }
                } else {
                    
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }
        this.setState({
            loading: false,
            refreshing: false
        })
    }

    refreshPlayers = async() => {
        this.setState({
            refreshing: true,
            page_number: 0,
            more_load: true,
        }, () => this.getPlayers())
    }

    messageSend = async(item) => {
        this.setState({
            message_send_item: item,
            message_send_popup: true
        })
    }

    sendRecruitsMessage = async() => {
        if(this.state.send_message == "") {
            Alert.alert(Constants.warnning, Constants.recruits_send_empty_message);
            return;
        }
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/message";
                                                
            console.log(TAG + " callSendRecruitsMessageAPI uri " + uri);
            let params = JSON.stringify({
                receivers: [this.state.message_send_item.id], 
                message: this.state.send_message
            })

            WebService.callServicePost(uri, params, this.handleSendRecruitsMessageAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleSendRecruitsMessageAPI = async(response, isError) => {
        console.log(TAG + " callSendRecruitsMessageAPI Response " + JSON.stringify(response));
        console.log(TAG + " callSendRecruitsMessageAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    Alert.alert("Message sent sccuessfully", "");
                    this.setState({
                        message_send_popup: false,
                        send_message: ''
                    })
                } else {
                    
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }
        this.setState({
            loading: false
        })
    }

    recruitChange = (item) => {

        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/set_recruit/" + item.id;
            var is_top = 0;
            if(item.is_top == 0) {
                is_top = 1;
            } else {
                is_top = 0;
            }
            let params = JSON.stringify({
                is_top: is_top
            })

            console.log(TAG + " callSetRecruitAPI uri " + uri);
            console.log(TAG + " callSetRecruitAPI params " + params);

            WebService.callServicePost(uri, params, this.handleSetRecruitAPI);

            var players_array = this.state.players_array;
            for(var i = 0; i < players_array.length; i ++) {
                if(players_array[i].id == item.id) {
                    if(players_array[i].is_top == 0) {
                        players_array[i].is_top = 1;
                    } else {
                        players_array[i].is_top = 0;
                    }
                    break;
                }
            }
            this.setState({
                players_array: players_array
            })

        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleSetRecruitAPI = async(response, isError) => {
        console.log(TAG + " callSetRecruitAPI Response " + JSON.stringify(response));
        console.log(TAG + " callSetRecruitAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {

                } else {
                    
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }
        this.setState({
            loading: false
        })
    }

    deleteUserPopUp = async(item) => {
        Alert.alert(Constants.delete_alert_title, Constants.delete_alert_message,
        [
            {text: 'OK', onPress: () => {
                this.deletePlayer(item)
            }},
            {text: 'Cancel', onPress: () => null},
        ],
            {cancelable: false}
        )
    }

    deletePlayer = async(item) => {
        try {
            this.setState({
                loading: true,
                selected_item: item
            });
            
            var uri = Global.BASE_URL + "/api/user/" + item.id;
                                                
            console.log(" callDeletePlayerAPI uri " + uri);

            WebService.callServiceDelete(uri, this.handleDeletePlayerAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleDeletePlayerAPI = async(response, isError) => {
        console.log(" callDeletePlayerAPI Response " + JSON.stringify(response));
        console.log(" callDeletePlayerAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    var players_array = this.state.players_array;
                    for(var i = 0; i < players_array.length; i ++) {
                        if(players_array[i].id == this.state.selected_item.id) {
                            players_array.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({
                        players_array: players_array,
                        selected_item: null
                    })
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }
        this.setState({
            loading: false,
            refreshing: false
        })
    }

    favoriteUser = async(item) => {
        try {
            this.setState({
                loading: true,
                selected_item: item
            });
            
            var uri = Global.BASE_URL + "/api/update_favorite";
            let params = JSON.stringify({
                favorited_id: item.id,
                favorite: 0
            })
                                                
            console.log(" callFavoriteUserAPI uri " + uri);
            console.log(" callFavoriteUserAPI params " + params);

            WebService.callServicePut(uri, params, this.handleFavoriteUserAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleFavoriteUserAPI = async(response, isError) => {
        console.log(" callFavoriteUserAPI Response " + JSON.stringify(response));
        console.log(" callFavoriteUserAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    var players_array = this.state.players_array;
                    for(var i = 0; i < players_array.length; i ++) {
                        if(players_array[i].id == this.state.selected_item.id) {
                            players_array.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({
                        players_array: players_array,
                        selected_item: null
                    })
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }
        this.setState({
            loading: false,
            refreshing: false
        })
    }

    render() {
        return (
            <Container style = {{flex: 1}} navigation = {this.props.navigation}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
            {
                this.state.message_send_popup &&
                <View style = {{width: '100%', height: '100%', position: 'absolute', zIndex: 10, elevation: 10, alignItems: 'center', justifyContent: 'center'}}>
                    <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.black, opacity: 0.3}}></View>
                    <View style = {{width: '90%', backgroundColor: Colors.white, borderRadius: 5, paddingHorizontal: 20, paddingVertical: 10}}>
                        <Text style = {{fontSize: 16, color: Colors.black}}>{"To " + this.state.message_send_item.name}</Text>
                        <TextInput style = {{width: '100%', height: 100, marginVertical: 15, padding: 15, color: Colors.black, fontSize: 14, borderColor: Colors.grey, borderWidth: 1, borderRadius: 5}} placeholder = {"Message"} placeholderTextColor = {Colors.grey} multiline = {true} onChangeText = {(text) => this.setState({send_message: text})}>{this.state.send_message}</TextInput>
                        <View style = {{width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: Colors.black, borderRadius: 5, backgroundColor: Colors.black}} onPress = {() => this.sendRecruitsMessage()}>
                                <Text style = {{fontSize: 16, color: Colors.white}}>{"SEND"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: Colors.black, borderRadius: 5, marginStart: 10}} onPress = {() => this.setState({message_send_popup: false, send_message: ''})}>
                                <Text style = {{fontSize: 16, color: Colors.black}}>{"CANCEL"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
                <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: Colors.primary}}>
                    <Image style = {{width: 30, height: 30, tintColor: Colors.white}} resizeMode = {'contain'} source={require('../assets/images/search_users.png')}/>
                    <View style = {{flex: 1, height: 40, backgroundColor: Colors.main_background, flexDirection: 'row', borderRadius: 5, marginStart: 10}}>
                        <View style = {{height: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                            <Image style = {{width: 20, height: 20, tintColor: Colors.grey}} resizeMode = {'contain'} source={require('../assets/images/search_icon.png')}/>
                        </View>
                        <TextInput style = {{flex: 1, padding: 5, fontSize: 16, color: Colors.black}} placeholder = {"Search ..."} placeholderTextColor = {Colors.grey} returnKeyType = {'search'} 
                            onChangeText = {(text) => this.setState({search_text: text})}
                            onSubmitEditing = {() => {
                                this.setState({
                                    refreshing: true,
                                    page_number: 0,
                                    more_load: true,
                                }, () => this.getPlayers()) 
                            }}>
                            {this.state.search_text}
                        </TextInput>
                    </View>
                </View>
                <View style = {{flex: 1, alignItems: 'center',}}>
                {
                    this.state.players_array.length == 0 &&
                    <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style = {{fontSize: 18, color: Colors.primary}}>{"There are no users!"}</Text>
                    </View>
                }
                    <FlatList
                        onRefresh={() => this.refreshPlayers()}
                        style = {{width: '100%'}}
                        refreshing={this.state.refreshing}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                            if(!this.onEndReachedCalledDuringMomentum && this.state.more_load && !this.state.refreshing) {
                                this.onEndReachedCalledDuringMomentum = true;
                                this.getPlayers();
                            }
                        }}
                        data={this.state.players_array}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                        renderItem={({ item, index }) => <PlayerCoachCard key = {index} style = {{marginTop: 15}} data = {item} navigation = {this.props.navigation} messageSend = {this.messageSend} recruitChange = {(data) => this.recruitChange(data)} deleteUser = {this.deleteUserPopUp} favoriteUser = {this.favoriteUser} type = {"Players"}/>}
                    >
                    </FlatList>
                </View>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    filter_item_container: {
        width: '100%', 
        height: 40, 
        paddingHorizontal: 15
    },
    filter_item_view: {
        width: '100%', 
        height: '100%', 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomColor: Colors.grey, 
        borderBottomWidth: 1
    },
    filter_item_text: {
        fontSize: 16, 
        color: Colors.primary
    },
    filter_item_list_text: {
        fontSize: 16, 
        color: Colors.primary,
        marginStart: 10
    },
    filter_item_dropdown_icon: {
        width: 15, 
        height: 15, 
        tintColor: Colors.black
    },
    filter_item_list_item_view: {
        width: '100%', 
        height: 40, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingStart: 10, 
        backgroundColor: Colors.transparent
    },
    filter_action_button: {
        paddingHorizontal: 15, 
        paddingVertical: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary
    },
    filter_action_button_text: {
        fontSize: 16,
        color: Colors.white
    },
    component_view: {
        width: '100%',
        height: 50,
        padding: 10,
        borderWidth: 0.5,
        borderColor: Colors.grey,
        borderRadius: 5,
        marginTop: 15,
        justifyContent: 'center'
    },
    text_input: {
        width: '100%',
        height: '100%',
        fontSize: 14,
        color: Colors.primary,
        padding: 0
    },
    button_style: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 0.5,
        borderColor: Colors.primary,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    }
})