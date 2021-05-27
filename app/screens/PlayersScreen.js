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
import { buildQuery, callGetRankingList } from '../utils/utils';
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
            favorite_array: [],
            players_array: [],
            page_number: 0,
            limit: 10,
            search_text: '',
            filter_type: 'filter', // '' when no filter, 'filter' when using filter
            filter_view_show: false,
            filter_positions: Constants.positions,
            filter_eligibilities: Constants.eligibilities,
            filter_states: Constants.states,
            filter_years: Constants.years,
            filter_selected_position_index: -1,
            filter_selected_eligibility_index: -1,
            filter_selected_state_index: -1,
            filter_selected_year_index: -1,

            message_send_popup: false,
            message_send_item: null,
            send_message: "",
            more_load: true,

            selected_item: null,
            new_user_popup: false,
            new_name: '',
            new_email: '',
            new_password: '',
            new_confirm_password: '',

            ranking_list: []
        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        if(this.state.user_role == "COACH") {
            this.getFavoriteList();
        } else {
            var ranking_list_response = await callGetRankingList();
            if(ranking_list_response.status) {
                this.setState({
                    ranking_list: ranking_list_response.ranking_list
                })
            }
            this.getPlayers();
        }
    }

    getFavoriteList = async() => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/favorite_list";
                                                
            console.log(TAG + " callGetFavoriteListAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetFavoriteAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    }

    handleGetFavoriteAPI = async(response, isError) => {
        console.log(TAG + " callGetFavoriteListAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetFavoriteListAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.setState({
                        favorite_array: response.favorites
                    })
                    this.getPlayers();
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }
        // this.setState({
        //     loading: false,
        //     refreshing: false
        // })
    }

    getPlayers = async() => {
        try {
            if(!this.state.refreshing) {
                this.setState({
                    loading: true,
                });
            }
            
            var query = "";
            var position = this.state.filter_selected_position_index == -1 ? "" : this.state.filter_positions[this.state.filter_selected_position_index].label;
            var eligibility = this.state.filter_selected_eligibility_index == -1 ? "" : this.state.filter_eligibilities[this.state.filter_selected_eligibility_index].label;
            var state = this.state.filter_selected_state_index == -1 ? "" : this.state.filter_states[this.state.filter_selected_state_index].label;
            var year = this.state.filter_selected_year_index == -1 ? "" : this.state.filter_years[this.state.filter_selected_year_index].label;
            query = buildQuery({
                role: "PLAYER",
                offset: this.state.page_number,
                limit: this.state.limit,
                search: this.state.search_text,
                position: position,
                eligibility: eligibility,
                state: state,
                year: year,
            });
            this.setState({
                filter_view_show: false,
            })
            
            var uri = Global.BASE_URL + "/api/profiles" + query;
                                                
            console.log(TAG + " callGetPlayersAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetPlayersAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    }

    handleGetPlayersAPI = async(response, isError) => {
        // console.log(TAG + " callGetPlayersAPI Response " + JSON.stringify(response));
        // console.log(TAG + " callGetPlayersAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    for(var i = 0; i < response.profiles.length; i ++) {
                        response.profiles[i].favorite = 0;
                        for(var j = 0; j < this.state.favorite_array.length; j ++) {
                            if(response.profiles[i].id == this.state.favorite_array[j].favorited_id) {
                                response.profiles[i].favorite = 1;
                                break;
                            }
                        }
                    }
                    console.log(TAG + " callGetPlayersAPI Response " + JSON.stringify(response));
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
                selected_item: item,
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
                    var ranking_list = response.ranking_list;
                    var players_array = this.state.players_array;
                    for(var i = 0; i < players_array.length; i ++) {
                        players_array[i].rank_num = null;
                        for(var j = 0; j < ranking_list.length; j ++) {
                            if(ranking_list[j].rank_num != null) {
                                if(players_array[i].id == ranking_list[j].user_id) {
                                    players_array[i].rank_num = ranking_list[j].rank_num;
                                    break;
                                }
                            }
                        }
                    }
                    this.setState({
                        players_array: players_array,
                        ranking_list: ranking_list
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

    favoriteUser = async(item) => {
        try {
            this.setState({
                loading: true,
                selected_item: item
            });
            
            var uri = Global.BASE_URL + "/api/update_favorite";
            var status = true;
            if(item.favorite == 1) {
                status = false;
            }
            let params = JSON.stringify({
                favorited_id: item.id,
                status: status
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
                    var players_array = this.state.players_array;
                    for(var i = 0; i < players_array.length; i ++) {
                        console.log(players_array[i].id + "   " + this.state.selected_item.id)
                        if(players_array[i].id == this.state.selected_item.id) {
                            if(players_array[i].favorite == 1) {
                                players_array[i].favorite = 0;
                            } else {
                                players_array[i].favorite = 1;
                            }
                            break;
                        }
                    }
                    this.setState({
                        players_array: players_array,
                        selected_item: null
                    })
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

    openPopUp = () => {
        this.setState({
            new_name: '',
            new_email: '',
            new_password: '',
            new_confirm_password: '',
            new_user_popup: true
        })
    }

    createPlayer = async() => {
        if(this.state.new_name.length < 4) {
            Alert.alert(Constants.warnning, "Name have to be at least 4 characters");
            return;
        }
        // if(this.state.new_email.length < 4) {
        //     Alert.alert(Constants.warnning, "Name have to be at least 4 characters");
        //     return;
        // }
        if(this.state.new_password.length < 4) {
            Alert.alert(Constants.warnning, Constants.user_password_length_error);
            return;
        }
        if(this.state.new_password != this.state.new_confirm_password) {
            Alert.alert(Constants.warnning, Constants.user_password_confirm_error);
            return;
        }
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/user";
                                                
            console.log(TAG + " callCreatePlayerAPI uri " + uri);
            let params = JSON.stringify({
                "email": this.state.new_email,
                "name": this.state.new_name,
                "password": this.state.new_password,
                "password-confirm": this.state.new_confirm_password,
                "role": "PLAYER"
            })

            WebService.callServicePost(uri, params, this.handleCreatePlayerAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleCreatePlayerAPI = async(response, isError) => {
        console.log(TAG + " callCreatePlayerAPI Response " + JSON.stringify(response));
        console.log(TAG + " callCreatePlayerAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    this.refreshPlayers();
                    this.setState({
                        new_user_popup: false
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

    setRanking= (item, rank_num) => {
        try {
            this.setState({
                loading: true,
                selected_item: item
            });
            
            var uri = Global.BASE_URL + "/api/set_ranking/" + item.id;
            let params = JSON.stringify({
                "rank_num": rank_num
            })
                                                
            console.log(" callSetRankingAPI uri " + uri);
            console.log(" callSetRankingAPI params " + params);

            WebService.callServicePost(uri, params, this.handleSetRankingAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleSetRankingAPI = async(response, isError) => {
        console.log(" callSetRankingAPI Response " + JSON.stringify(response));
        console.log(" callSetRankingAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    var ranking_list = response.ranking_list;
                    var players_array = this.state.players_array;
                    for(var i = 0; i < players_array.length; i ++) {
                        for(var j = 0; j < ranking_list.length; j ++) {
                            if(players_array[i].id == ranking_list[j].user_id) {
                                players_array[i].rank_num = ranking_list[j].rank_num;
                                break;
                            }
                        }
                    }
                    this.setState({
                        players_array: players_array,
                        ranking_list: ranking_list
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
            {
                this.state.new_user_popup &&
                <View style = {{width: '100%', height: '100%', position: 'absolute', zIndex: 10}}>
                    <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.black, opacity: 0.3,}}/>
                    <View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <View style = {{width: '90%', borderRadius: 10, overflow: 'hidden'}}>
                            <KeyboardAwareScrollView>
                            <View style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Colors.primary}}>
                                <Text style = {{fontSize: 16, color: Colors.white}}>{"Create New Player"}</Text>
                            </View>
                            <View style = {{paddingHorizontal: 15, backgroundColor: Colors.white}}>
                                <View style = {styles.component_view}>
                                    <TextInput style = {styles.text_input} placeholder = {"Name*"} placeholderTextColor = {Colors.grey}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                new_name: text
                                            })
                                        }}
                                    >{this.state.new_name}</TextInput>
                                </View>
                                <View style = {styles.component_view}>
                                    <TextInput style = {styles.text_input} placeholder = {"Email*"} placeholderTextColor = {Colors.grey}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                new_email: text
                                            })
                                        }}
                                    >{this.state.new_email}</TextInput>
                                </View>
                                <View style = {styles.component_view}>
                                    <TextInput style = {styles.text_input} placeholder = {"Password*"} placeholderTextColor = {Colors.grey} secureTextEntry = {true}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                new_password: text
                                            })
                                        }}
                                    >{this.state.new_password}</TextInput>
                                </View>
                                <View style = {styles.component_view}>
                                    <TextInput style = {styles.text_input} placeholder = {"Password*"} placeholderTextColor = {Colors.grey} secureTextEntry = {true}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                new_confirm_password: text
                                            })
                                        }}
                                    >{this.state.new_confirm_password}</TextInput>
                                </View>
                                <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 20}}>
                                    <TouchableOpacity style = {[styles.button_style, {backgroundColor: Colors.primary}]} onPress = {() => this.createPlayer()}>
                                        <Text style = {{fontSize: 16, color: Colors.white}}>{"SAVE"}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {[styles.button_style, ]} onPress = {() => this.setState({new_user_popup: false})}>
                                        <Text style = {{fontSize: 16, color: Colors.primary}}>{"CANCEL"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            </KeyboardAwareScrollView>
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
                <TouchableOpacity style = {{width: '100%', paddingVertical: 10, backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.setState({filter_view_show: !this.state.filter_view_show})}>
                    <Image style = {{width: 25, height: 25, tintColor: Colors.black}} resizeMode = {'contain'} source={require('../assets/images/filter_pull_down.png')}/>
                    <Text style = {{fontSize: 16, color: Colors.black, marginStart: 15}}>{"FILTER"}</Text>
                </TouchableOpacity>
            
            {
                this.state.filter_view_show &&
                <View style = {{width: '100%', backgroundColor: '#e0e0e0'}}>
                    <ModalDropdown 
                        dropdownStyle = {{width: '100%', height: 40 * 8, backgroundColor: '#e0e0e0'}}
                        defaultIndex = {0}
                        options = {this.state.filter_positions}
                        onSelect = {(index) => {
                            this.setState({
                                filter_selected_position_index: index
                            })
                        }}
                        renderButton = {() => {
                            return (
                                <View style = {styles.filter_item_container}>
                                    <View style = {styles.filter_item_view}>
                                        <Text style = {styles.filter_item_text}>{this.state.filter_selected_position_index == -1 ? "Position" : this.state.filter_positions[this.state.filter_selected_position_index].label}</Text>
                                        <View style = {{flex: 1, alignItems: 'flex-end', justifyContent: 'center',}}>
                                            <Image style = {styles.filter_item_dropdown_icon} resizeMode = {'contain'} source={require('../assets/images/dropdown_triangle.png')}/>
                                        </View>
                                    </View>
                                </View>
                            )
                        }}
                        renderRow = {(item, index, highlighted) => {
                            return (
                                <View key = {index} style = {styles.filter_item_list_item_view}>
                                    <Text style = {styles.filter_item_list_text}>{item.label}</Text>
                                </View>
                            )
                        }}
                    />
                    <ModalDropdown 
                        dropdownStyle = {{width: '100%', height: 40 * 6, backgroundColor: '#e0e0e0'}}
                        defaultIndex = {0}
                        options = {this.state.filter_eligibilities}
                        onSelect = {(index) => {
                            this.setState({
                                filter_selected_eligibility_index: index
                            })
                        }}
                        renderButton = {() => {
                            return (
                                <View style = {styles.filter_item_container}>
                                    <View style = {styles.filter_item_view}>
                                        <Text style = {styles.filter_item_text}>{this.state.filter_selected_eligibility_index == -1 ? "Eligibility" : this.state.filter_eligibilities[this.state.filter_selected_eligibility_index].label}</Text>
                                        <View style = {{flex: 1, alignItems: 'flex-end', justifyContent: 'center',}}>
                                            <Image style = {styles.filter_item_dropdown_icon} resizeMode = {'contain'} source={require('../assets/images/dropdown_triangle.png')}/>
                                        </View>
                                    </View>
                                </View>
                            )
                        }}
                        renderRow = {(item, index, highlighted) => {
                            return (
                                <View key = {index} style = {styles.filter_item_list_item_view}>
                                    <Text style = {styles.filter_item_list_text}>{item.label}</Text>
                                </View>
                            )
                        }}
                    />
                    <ModalDropdown 
                        dropdownStyle = {{width: '100%', height: 40 * 8, backgroundColor: '#e0e0e0'}}
                        defaultIndex = {0}
                        options = {this.state.filter_states}
                        onSelect = {(index) => {
                            this.setState({
                                filter_selected_state_index: index
                            })
                        }}
                        renderButton = {() => {
                            return (
                                <View style = {styles.filter_item_container}>
                                    <View style = {styles.filter_item_view}>
                                        <Text style = {styles.filter_item_text}>{this.state.filter_selected_state_index == -1 ? "State" : this.state.filter_states[this.state.filter_selected_state_index].label}</Text>
                                        <View style = {{flex: 1, alignItems: 'flex-end', justifyContent: 'center',}}>
                                            <Image style = {styles.filter_item_dropdown_icon} resizeMode = {'contain'} source={require('../assets/images/dropdown_triangle.png')}/>
                                        </View>
                                    </View>
                                </View>
                            )
                        }}
                        renderRow = {(item, index, highlighted) => {
                            return (
                                <View key = {index} style = {styles.filter_item_list_item_view}>
                                    <Text style = {styles.filter_item_list_text}>{item.label}</Text>
                                </View>
                            )
                        }}
                    />
                    <ModalDropdown 
                        dropdownStyle = {{width: '100%', height: 40 * 8, backgroundColor: '#e0e0e0'}}
                        defaultIndex = {0}
                        options = {this.state.filter_years}
                        onSelect = {(index) => {
                            this.setState({
                                filter_selected_year_index: index
                            })
                        }}
                        renderButton = {() => {
                            return (
                                <View style = {styles.filter_item_container}>
                                    <View style = {styles.filter_item_view}>
                                        <Text style = {styles.filter_item_text}>{this.state.filter_selected_year_index == -1 ? "Year" : this.state.filter_years[this.state.filter_selected_year_index].label}</Text>
                                        <View style = {{flex: 1, alignItems: 'flex-end', justifyContent: 'center',}}>
                                            <Image style = {styles.filter_item_dropdown_icon} resizeMode = {'contain'} source={require('../assets/images/dropdown_triangle.png')}/>
                                        </View>
                                    </View>
                                </View>
                            )
                        }}
                        renderRow = {(item, index, highlighted) => {
                            return (
                                <View key = {index} style = {styles.filter_item_list_item_view}>
                                    <Text style = {styles.filter_item_list_text}>{item.label}</Text>
                                </View>
                            )
                        }}
                    />
                    <View style = {{width: '100%', flexDirection: 'row', justifyContent: 'center', paddingVertical: 15, }}>
                        <TouchableOpacity style = {styles.filter_action_button} onPress = {() => {
                            this.setState({
                                refreshing: true,
                                page_number: 0,
                                more_load: true,
                            }, () => this.getPlayers()) 
                        }}>
                            <Text style = {styles.filter_action_button_text}>{"APPLY"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {[styles.filter_action_button, {marginStart: 15}]} onPress = {() => {
                            this.setState({
                                filter_selected_position_index: -1,
                                filter_selected_eligibility_index: -1,
                                filter_selected_state_index: -1,
                                filter_selected_year_index: -1,
                                refreshing: true,
                                page_number: 0,
                                more_load: true,
                            }, () => this.getPlayers())
                        }}>
                            <Text style = {styles.filter_action_button_text}>{"CLEAR"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
                <View style = {{flex: 1, alignItems: 'center',}}>
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
                        renderItem={({ item, index }) => <PlayerCoachCard key = {index} style = {{marginTop: 15}} data = {item} ranking_list = {this.state.ranking_list} navigation = {this.props.navigation} messageSend = {this.messageSend} recruitChange = {(data) => this.recruitChange(data)} deleteUser = {this.deleteUserPopUp} favoriteUser = {this.favoriteUser} setRanking = {this.setRanking} type = {"Players"}/>}
                    >
                    </FlatList>
                </View>
            {
                this.state.user_role == "ADMIN" &&
                <View style = {{position: 'absolute', bottom: 20, right: 20, }}>
                    <TouchableOpacity style = {{width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.openPopUp()}>
                        <Image style = {{width: 30, height: 30, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/plus.png')}></Image>
                    </TouchableOpacity>
                </View>
            }
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