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
import MessageCard from '../components/MessageCard';
import GameCard from '../components/GameCard';
import ScheduleCard from '../components/ScheduleCard';
import { buildQuery } from '../utils/utils';
import ModalDropdown from "../components/react-native-modal-dropdown/ModalDropdown";
import moment from 'moment';
import { EventRegister } from 'react-native-event-listeners';

var TAG = "MessagesScreen";

export default class MessagesScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            refreshing: false,
            messages_array: [],
            page_number: 0,
            limit: 10,
            search_text: '',
            message_type: 0, // 0: inbox, 1: sent
            select_message_type: 'none', // none, all, indeterminate
            display_type: 'list_view', // list_view, detail_view
            message_detail: null, // message item for detail view
            message_detail_opponent: null, // opponent for detail view message
            delete_type: '', // message_detail: delete message in detail page, selected_messages: delete several messages in list

            message_send_popup: false,
            message_send_item: null,
            send_message: "",
            more_load: true,
        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        this.getMessages();
    }

    getMessages = async() => {
        try {
            if(!this.state.refreshing) {
                this.setState({
                    loading: true,
                });
            }
            var type = 'inbox';
            if(this.state.message_type == 1) {
                type = 'sent'
            }
            var query = buildQuery({
                offset: this.state.page_number,
                limit: this.state.limit,
                search: this.state.search_text,
                type: type
            });
            
            var uri = Global.BASE_URL + "/api/messages" + query;
                                                
            console.log(TAG + " callGetMessagesAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetMessagesAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    }

    handleGetMessagesAPI = async(response, isError) => {
        console.log(TAG + " callGetMessagesAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetMessagesAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    for(var i =0; i < response.messages.length; i ++) {
                        response.messages[i].type = this.state.message_type;
                        response.messages[i].delete_check = false;
                    }
                    if(this.state.refreshing) {
                        this.setState({
                            messages_array: response.messages
                        })
                    } else {
                        this.setState({
                            messages_array: [...this.state.messages_array, ...response.messages]
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

    refreshMessages = async() => {
        this.setState({
            refreshing: true,
            page_number: 0,
            more_load: true,
        }, () => this.getMessages())
    }

    selectMessage = (item) => {
        if(typeof(item) == 'string') { //check all
            var messages_array = this.state.messages_array;
            for(var i = 0; i < messages_array.length; i ++) {
                if(this.state.select_message_type == 'all') {
                    messages_array[i].delete_check = false;
                } else {
                    messages_array[i].delete_check = true;
                }
            }
            this.setState({
                messages_array: messages_array,
                select_message_type: 'all'
            })
            if(this.state.select_message_type == 'all' || messages_array.length == 0) {
                this.setState({
                    select_message_type: 'none'
                })
            } else {
                this.setState({
                    select_message_type: 'all'
                }) 
            }
        } else {
            var messages_array = this.state.messages_array;
            for(var i = 0; i < messages_array.length; i ++) {
                if(messages_array[i].id == item.id) {
                    messages_array[i].delete_check = !messages_array[i].delete_check;
                } 
            }
            var selected_message_count = 0;
            for(var i = 0; i < messages_array.length; i ++) {
                if(messages_array[i].delete_check) {
                    selected_message_count ++;
                } 
            }

            this.setState({
                messages_array: messages_array,
            })
            if(selected_message_count == 0 || messages_array.length == 0) {
                this.setState({
                    select_message_type: 'none'
                })
            } else if(selected_message_count < this.state.messages_array.length) {
                this.setState({
                    select_message_type: 'indeterminate'
                }) 
            } else {
                this.setState({
                    select_message_type: 'all'
                }) 
            }
        }
    }

    messageReply = async(item) => {
        console.log(item)
        this.setState({
            message_send_item: item,
            message_send_popup: true
        })
    }

    sendReplyMessage = async(item_array) => {
        if(this.state.send_message == "") {
            Alert.alert(Constants.warnning, Constants.recruits_send_empty_message);
            return;
        }
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/message";
                                                
            var id_array = [];
            for(var i = 0; i < item_array.length; i ++) {
                id_array.push(item_array[i].id)
            }

            let params = JSON.stringify({
                receivers: id_array, 
                message: this.state.send_message
            })

            console.log(TAG + " callSendReplyMessageAPI uri " + uri);
            console.log(TAG + " callSendReplyMessageAPI params " + params);
            WebService.callServicePost(uri, params, this.handleSendReplyMessageAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleSendReplyMessageAPI = async(response, isError) => {
        console.log(TAG + " callSendReplyMessageAPI Response " + JSON.stringify(response));
        console.log(TAG + " callSendReplyMessageAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.setState({
                        send_message: '',
                        message_send_popup: false,
                        message_send_item: null
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

    messageDetail = (item) => {
        if(item.type == 0) {
            this.setState({
                message_detail_opponent: item.sender
            })
        } else {
            this.setState({
                message_detail_opponent: item.receiver
            })
        }
        
        this.setState({
            message_detail: item,
            display_type: 'detail_view',
        })

        this.getMessageDetail(item);
        
    }

    getMessageDetail = async(item) => {
        try {
            var uri = Global.BASE_URL + "/api/message/" + item.id;
                                     
            console.log(TAG + " callGetMessageDetailAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetMessageDetailAPI);
        } catch (error) {
            console.log(error)
            
        }
    }

    handleGetMessageDetailAPI = async(response, isError) => {
        console.log(TAG + " callGetMessageDetailAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetMessageDetailAPI isError " + isError);
        try {
            if(!isError) {
                if(response != null) {
                    var messages_array = this.state.messages_array;
                    for(var i = 0; i < messages_array.length; i ++) {
                        if(messages_array[i].id == this.state.message_detail.id) {
                            messages_array[i].status = 1;
                            break;
                        }
                    }
                    this.setState({
                        messages_array: messages_array
                    })
                    EventRegister.emit(Constants.NOTIFICATION_CHANGED, "");
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }

    }

    deleteMessages = async(delete_type) => {
        var id_array = [];
        if(delete_type == "message_detail") { // from detail view
            id_array.push(this.state.message_detail.id);
        } else {
            for(var i = 0; i < this.state.messages_array.length; i ++) {
                if(this.state.messages_array[i].delete_check) {
                    id_array.push(this.state.messages_array[i].id);
                }
            }
        }
        
        try {
            this.setState({
                loading: true,
                delete_type: delete_type
            });
            
            var uri = Global.BASE_URL + "/api/delete_messages";
            
            let params = JSON.stringify(id_array)

            console.log(TAG + " callDeleteMessageAPI uri " + uri);
            console.log(TAG + " callDeleteMessageAPI params " + params);
            WebService.callServicePost(uri, params, this.handleDeleteMessageAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleDeleteMessageAPI = async(response, isError) => {
        console.log(TAG + " callDeleteMessageAPI Response " + JSON.stringify(response));
        console.log(TAG + " callDeleteMessageAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    var messages_array = this.state.messages_array;
                    if(this.state.delete_type == "message_detail") {
                        for(var index = 0; index < messages_array.length; index ++) {
                            console.log(this.state.message_detail.id + "    " + messages_array[index].id)
                            if(messages_array[index].id == this.state.message_detail.id) {
                                console.log(messages_array.length)
                                messages_array.splice(index, 1);
                                console.log(messages_array.length)
                                break;
                            }
                        }
                    } else {
                        var index = 0;
                        while (index < messages_array.length) {
                            if(messages_array[index].delete_check) {
                                messages_array.splice(index, 1);
                            } else {
                                index ++;
                            }
                        }
                    }
                    this.setState({
                        messages_array: messages_array,
                        display_type: "list_view"
                    })
                    if(this.state.display_type == "list_view") {
                        var selected_message_count = 0;
                        for(var i = 0; i < messages_array.length; i ++) {
                            if(messages_array[i].delete_check) {
                                selected_message_count ++;
                            } 
                        }

                        this.setState({
                            messages_array: messages_array,
                        })
                        if(selected_message_count == 0 || messages_array.length == 0) {
                            this.setState({
                                select_message_type: 'none'
                            })
                        } else if(selected_message_count < this.state.messages_array.length) {
                            this.setState({
                                select_message_type: 'indeterminate'
                            }) 
                        } else {
                            this.setState({
                                select_message_type: 'all'
                            }) 
                        }
                    }
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
                        <TextInput style = {{width: '100%', height: 100, marginVertical: 15, padding: 15, color: Colors.black, fontSize: 14, borderColor: Colors.grey, borderWidth: 1, borderRadius: 5, textAlignVertical: 'top'}} placeholder = {"Message"} placeholderTextColor = {Colors.grey} multiline = {true} onChangeText = {(text) => this.setState({send_message: text})}>{this.state.send_message}</TextInput>
                        <View style = {{width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: Colors.black, borderRadius: 5, backgroundColor: Colors.black}} onPress = {() => this.sendReplyMessage([this.state.message_send_item])}>
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
                    <View style = {{flex: 1, height: 40, backgroundColor: Colors.main_background, flexDirection: 'row', borderRadius: 5, marginStart: 10}}>
                        <View style = {{height: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                            <ModalDropdown 
                                dropdownStyle = {{width: 150, height: 30 * 2, backgroundColor: '#e0e0e0'}}
                                defaultIndex = {0}
                                options = {[{label: "Inbox", icon: require('../assets/images/menu_button.png')}, {label: "Sent", icon: require('../assets/images/menu_button.png')}]}
                                onSelect = {(index) => {
                                    if(this.state.message_type == index) {
                                        return
                                    }
                                    this.setState({
                                        display_type: "list_view",
                                        message_type: index,
                                        page_number: 0,
                                        more_load: true,
                                        refreshing: true
                                    }, () =>this.getMessages())
                                }}
                                renderButton = {() => {
                                    return (
                                        <View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                                            <Image style = {{width: 20, height: 20, tintColor: Colors.grey}} resizeMode = {'contain'} source={require('../assets/images/menu_button.png')}/>
                                        </View>
                                    )
                                }}
                                renderRow = {(item, index, highlighted) => {
                                    return (
                                        <View key = {index} style = {{width: '100%', height: 30, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, backgroundColor: this.state.message_type == index ? Colors.secondary : null}}>
                                            <Image style = {{width: 20, height:20, tintColor: Colors.grey}} resizeMode = {'contain'} source={item.icon}/>
                                            <Text style = {{fontSize: 14, color: Colors.grey, marginStart: 20}}>{item.label}</Text>
                                        </View>
                                    )
                                }}
                            />
                            
                        </View>
                        <View style = {{height: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center'}}>
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
                
                <View style = {{flex: 1, alignItems: 'center'}}>
                    <View style = {{width: '100%', height: 120, position: 'absolute', left: 0, top: 0, backgroundColor: Colors.primary}}></View>
                    <View style = {{flex: 1, width: '100%', paddingHorizontal: 15}}>
                    {
                        this.state.display_type == 'list_view' &&
                        <View style = {{flex: 1, width: '100%', borderTopLeftRadius: 15, borderTopRightRadius: 15, overflow: 'hidden', backgroundColor: Colors.white}}>
                            <View style = {{width: '100%', height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderBottomColor: Colors.light_grey, borderBottomWidth: 1}}>
                                <TouchableOpacity style = {{width: 40, aspectRatio: 1, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.selectMessage("all")}>
                                {
                                    this.state.select_message_type == "none" &&
                                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/message_uncheck.png')}></Image>
                                }
                                {
                                    this.state.select_message_type == "all" &&
                                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.secondary}} source = {require('../assets/images/message_check.png')}></Image>
                                }
                                {
                                    this.state.select_message_type == "indeterminate" &&
                                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/message_indeterminate_check.png')}></Image>
                                }
                                </TouchableOpacity>
                            {
                                this.state.select_message_type != "none" &&
                                <TouchableOpacity style = {{width: 40, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginStart: 20}} onPress = {() => this.deleteMessages("selected_messages")}>
                                    <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/delete.png')}></Image>
                                </TouchableOpacity>
                            }
                            </View>
                            <FlatList
                                onRefresh={() => this.refreshMessages()}
                                style = {{width: '100%'}}
                                refreshing={this.state.refreshing}
                                onEndReachedThreshold={0.5}
                                onEndReached={() => {
                                    if(!this.onEndReachedCalledDuringMomentum && this.state.more_load && !this.state.refreshing) {
                                        this.onEndReachedCalledDuringMomentum = true;
                                        this.getMessages();
                                    }
                                }}
                                data={this.state.messages_array}
                                extraData={this.state}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item, index) => index.toString()}
                                onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                                renderItem={({ item, index }) => 
                                    <MessageCard key = {index} 
                                        data = {item} 
                                        display_type = {this.state.display_type}
                                        navigation = {this.props.navigation} 
                                        selectMessage = {this.selectMessage} 
                                        messageReply = {this.messageReply}
                                        messageDetail = {this.messageDetail}/>
                                }
                            >
                            </FlatList>
                        </View>
                    }
                    {
                        this.state.display_type == 'detail_view' &&
                        <View style = {{flex: 1, width: '100%', borderTopLeftRadius: 15, borderTopRightRadius: 15, overflow: 'hidden', backgroundColor: Colors.white}}>
                            <View style = {{width: '100%', height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderBottomColor: Colors.light_grey, borderBottomWidth: 1}}>
                                <TouchableOpacity style = {{width: 40, aspectRatio: 1, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.setState({display_type: 'list_view'})}>
                                    <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/left_arrow.png')}></Image>
                                </TouchableOpacity>
                            </View>
                            <View style = {{flex: 1, width: '100%', paddingHorizontal: 15}}>
                                <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 15,}}>
                                    <View style = {{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                        <View style = {{width: 40, aspectRatio: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.grey, alignItems: 'center', justifyContent: 'center'}}>
                                        {
                                            this.state.message_detail_opponent.avatar != null && this.state.message_detail_opponent.avatar != "" &&
                                            <Image style = {{width: '100%', height: '100%', resizeMode: 'cover'}} source = {{uri: Global.BASE_URL +  this.state.message_detail_opponent.avatar}}></Image>
                                        }
                                        {
                                            !(this.state.message_detail_opponent.avatar != null && this.state.message_detail_opponent.avatar != "") &&
                                            <Text style = {{fontSize: 32, color: Colors.white}}>{this.state.message_detail_opponent.name != null ? this.state.message_detail_opponent.name.charAt(0).toUpperCase() : ""}</Text>
                                        }
                                        </View>
                                        <View style = {{flex: 1, justifyContent: 'space-around', marginStart: 10}}>
                                            <Text style = {{fontSize: 16, color: Colors.primary}}>{this.state.message_detail_opponent.name != null ? this.state.message_detail_opponent.name : "No Name"}</Text>
                                            <Text style = {{fontSize: 16, color: Colors.grey}}>{moment(this.state.message_detail.date).format("yyyy-MM-DD hh:mm:ss")}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style = {{width: 40, aspectRatio: 1, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.messageReply(this.state.message_detail_opponent)}>
                                        <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/message_reply.png')}></Image>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {{width: 40, aspectRatio: 1, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.deleteMessages("message_detail")}>
                                        <Image style = {{width: 25, height: 25, resizeMode: 'contain', tintColor: Colors.grey}} source = {require('../assets/images/delete.png')}></Image>
                                    </TouchableOpacity>
                                </View>
                                <Text style = {{flex: 1, width: '100%', fontSize: 14, color: Colors.grey, marginTop: 5}} >{this.state.message_detail.message}</Text>
                            </View>
                        </View>
                    }
                    </View>
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
    }
})