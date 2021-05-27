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

var TAG = "CoachesScreen";

export default class CoachesScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            loading: false,
            refreshing: false,
            coaches_array: [],
            page_number: 0,
            limit: 10,
            search_text: '',
            

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
        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        this.getCoaches();
    }

    getCoaches = async() => {
        try {
            if(!this.state.refreshing) {
                this.setState({
                    loading: true,
                });
            }
            
            var query = buildQuery({
                role: "COACH",
                offset: this.state.page_number,
                limit: this.state.limit,
                search: this.state.search_text,
            });
            this.setState({
                filter_view_show: false,
            })
            
            var uri = Global.BASE_URL + "/api/profiles" + query;
                                                
            console.log(TAG + " callGetCoachesAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetCoachesAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    }

    handleGetCoachesAPI = async(response, isError) => {
        console.log(TAG + " callGetCoachesAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetCoachesAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    if(this.state.refreshing) {
                        this.setState({
                            coaches_array: response.profiles
                        })
                    } else {
                        this.setState({
                            coaches_array: [...this.state.coaches_array, ...response.profiles]
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

    refreshCoaches = async() => {
        this.setState({
            refreshing: true,
            page_number: 0,
            more_load: true,
        }, () => this.getCoaches())
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
                this.deleteCoach(item)
            }},
            {text: 'Cancel', onPress: () => null},
        ],
            {cancelable: false}
        )
    }

    deleteCoach = async(item) => {
        try {
            this.setState({
                loading: true,
                selected_item: item
            });
            
            var uri = Global.BASE_URL + "/api/user/" + item.id;
                                                
            console.log(" callDeleteCoachAPI uri " + uri);

            WebService.callServiceDelete(uri, this.handleDeleteCoachAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleDeleteCoachAPI = async(response, isError) => {
        console.log(" callDeleteCoachAPI Response " + JSON.stringify(response));
        console.log(" callDeleteCoachAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    var coaches_array = this.state.coaches_array;
                    for(var i = 0; i < coaches_array.length; i ++) {
                        if(coaches_array[i].id == this.state.selected_item.id) {
                            coaches_array.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({
                        coaches_array: coaches_array,
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

    createCoach = async() => {
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
                                                
            console.log(TAG + " callCreateCoachAPI uri " + uri);
            let params = JSON.stringify({
                "email": this.state.new_email,
                "name": this.state.new_name,
                "password": this.state.new_password,
                "password-confirm": this.state.new_confirm_password,
                "role": "COACH"
            })

            WebService.callServicePost(uri, params, this.handleCreateCoachAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleCreateCoachAPI = async(response, isError) => {
        console.log(TAG + " callCreateCoachAPI Response " + JSON.stringify(response));
        console.log(TAG + " callCreateCoachAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    this.refreshCoaches();
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
                                    <TouchableOpacity style = {[styles.button_style, {backgroundColor: Colors.primary}]} onPress = {() => this.createCoach()}>
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
                                }, () => this.getCoaches()) 
                            }}>
                            {this.state.search_text}
                        </TextInput>
                    </View>
                </View>
                
                <View style = {{flex: 1, alignItems: 'center',}}>
                    <FlatList
                        onRefresh={() => this.refreshCoaches()}
                        style = {{width: '100%'}}
                        refreshing={this.state.refreshing}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                            if(!this.onEndReachedCalledDuringMomentum && this.state.more_load && !this.state.refreshing) {
                                this.onEndReachedCalledDuringMomentum = true;
                                this.getCoaches();
                            }
                        }}
                        data={this.state.coaches_array}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                        renderItem={({ item, index }) => <PlayerCoachCard key = {index} style = {{marginTop: 15}} data = {item} navigation = {this.props.navigation} messageSend = {this.messageSend} deleteUser = {this.deleteUserPopUp} type = {"Coaches"}/>}
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