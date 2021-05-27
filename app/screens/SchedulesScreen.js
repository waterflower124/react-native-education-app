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
    Linking,
    KeyboardAvoidingView,
    Keyboard,
    Modal
 } from "react-native";

import { Colors } from '../utils/Colors';
import { stylesGlobal } from '../Global/stylesGlobal';
import ProgressIndicator from "../components/ProgressIndicator";
import * as Global from "../Global/Global";
import WebService from "../utils/WebService";
import { Constants } from "../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Container from '../components/Container';
import ScheduleCard from '../components/ScheduleCard';
import { buildQuery } from '../utils/utils';
import ModalDropdown from "../components/react-native-modal-dropdown/ModalDropdown";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from '../components/react-native-actionsheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";

var TAG = "SchedulesScreen";

export default class SchedulesScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            loading: false,
            refreshing: false,
            schedule_array: [],
            page_number: 0,
            limit: 10,
            search_text: '',

            visibleModal: false,
            selected_index: -1,

            selected_title: '',
            selected_location: '',
            selected_date: moment(new Date()).format(),
            selected_link: '',
            selected_desc: '',

            isDatePickerVisible: false,
        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        this.getSchedules();
    }

    getSchedules = async() => {
        try {
            if(!this.state.refreshing) {
                this.setState({
                    loading: true,
                });
            }
            
            var query = buildQuery({
                search: this.state.search_text,
            });
            
            var uri = Global.BASE_URL + "/api/schedules" + query;
                                                
            console.log(TAG + " callGetSchedulesAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetSchedulesAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    }

    handleGetSchedulesAPI = async(response, isError) => {
        console.log(TAG + " callGetSchedulesAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetSchedulesAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    if(this.state.refreshing) {
                        this.setState({
                            schedule_array: response.schedules
                        })
                    } else {
                        this.setState({
                            schedule_array: [...this.state.schedule_array, ...response.schedules]
                        })
                    }
                    if(response.schedules.length < this.state.limit) {
                        this.setState({
                            more_load: false
                        })
                    } else {
                        this.setState({
                            page_number: this.state.page_number + 1,
                            more_load: true
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

    refreshSchedules = async() => {
        this.setState({
            refreshing: true,
            page_number: 0,
            more_load: true,
        }, () => this.getSchedules())
    }

    isURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(str);
    }

    deleteSchedulePopUp = async(item) => {
        Alert.alert(Constants.delete_alert_title, Constants.delete_alert_message,
        [
            {text: 'OK', onPress: () => {
                this.deleteSchedule(item)
            }},
            {text: 'Cancel', onPress: () => null},
        ],
            {cancelable: false}
        )
    }

    deleteSchedule = async(item) => {
        try {
            this.setState({
                loading: true,
                selected_item: item
            });
            
            var uri = Global.BASE_URL + "/api/schedule/" + item.id;
                                                
            console.log(" callDeleteScheduleAPI uri " + uri);

            WebService.callServiceDelete(uri, this.handleDeleteScheduleAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleDeleteScheduleAPI = async(response, isError) => {
        console.log(" callDeleteScheduleAPI Response " + JSON.stringify(response));
        console.log(" callDeleteScheduleAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    var schedule_array = this.state.schedule_array;
                    for(var i = 0; i < schedule_array.length; i ++) {
                        if(schedule_array[i].id == this.state.selected_item.id) {
                            schedule_array.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({
                        schedule_array: schedule_array,
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

    openModal = (item) => {
        if(item == null) {
            this.setState({
                selected_index: -1,

                selected_title: '',
                selected_location: '',
                selected_date: moment(new Date()).format(),
                selected_link: '',
                selected_desc: '',
            })
        } else {
            var index = 0;
            for(var i = 0; i < this.state.schedule_array.length; i ++) {
                if(this.state.schedule_array[i].id == item.id) {
                    index = i;
                    break
                }
            }
            this.setState({
                selected_title: this.state.schedule_array[index].title,
                selected_location: this.state.schedule_array[index].location,
                selected_date: this.state.schedule_array[index].date,
                selected_link: this.state.schedule_array[index].link,
                selected_desc: this.state.schedule_array[index].desc,
                selected_index: index
            })
        }
        
        this.setState({
            visibleModal: true
        })
    }

    scheduleEditCreate = async() => {
        try {
            if(this.state.selected_title.length == 0) {
                Alert.alert(Constants.warnning, Constants.schedule_title_error);
                return;
            }
            if(this.state.selected_location.length = 0) {
                Alert.alert(Constants.warnning, Constants.schedule_location_error);
                return;
            }
            
            this.setState({
                loading: true,
            });
            var uri = Global.BASE_URL + "/api/schedule";
            
            var params = {
                title: this.state.selected_title,
                location: this.state.selected_location,
                date: this.state.selected_date,
                desc: this.state.selected_desc,
                link: this.state.selected_link,
                user_id: 0,
            }
            if(this.state.selected_index != -1) {
                params.id = this.state.user_schedules[this.state.selected_index].id
            }
                                    
            console.log(" callCreateEditScheduleAPI uri " + uri);
            console.log(" callCreateEditScheduleAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, JSON.stringify(params), this.handleEditCreateScheduleAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleEditCreateScheduleAPI = async(response, isError) => {
        console.log(" callCreateEditScheduleAPI Response " + JSON.stringify(response));
        console.log(" callCreateEditScheduleAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    if(this.state.selected_index == -1) {
                        this.refreshSchedules()
                    } else {
                        var user_schedules = this.state.user_schedules;
                        user_schedules[this.state.selected_index].title = this.state.selected_title;
                        user_schedules[this.state.selected_index].location = this.state.selected_location;
                        user_schedules[this.state.selected_index].date = this.state.selected_date;
                        user_schedules[this.state.selected_index].link = this.state.selected_link;
                        user_schedules[this.state.selected_index].desc = this.state.selected_desc;
                        this.setState({
                            user_schedules: user_schedules
                        })
                    }
                    this.setState({
                        visibleModal: false
                    })
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

    render() {
        return (
            <Container style = {{flex: 1}} navigation = {this.props.navigation}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
                <ActionSheet
                    ref={o => this.SelectImageActionSheet = o}
                    title={"Select Image"}
                    options={["Select from Camera", "Select from Library", "Cancel"]}
                    cancelButtonIndex={2}
                    // destructiveButtonIndex={1}
                    onPress={(index) => { 
                        var options = {
                            mediaType: 'photo',
                            includeBase64: false,
                        };
                        if(index == 0) {
                            launchCamera(options, (response) => {
                                console.log('Response = ', response.type);
                    
                                if (response.didCancel) {
                                    console.log('User cancelled image picker');
                                } else if (response.error) {
                                    console.log('ImagePicker Error: ', response.error);
                                } else if (response.customButton) {
                                    console.log('User tapped custom button: ', response.customButton);
                                } else {
                                    this.setState({
                                        selected_upload_image: response.uri
                                    })
                                }
                            });
                        } else if(index == 1) {
                            launchImageLibrary(options, (response) => {
                                console.log('Response = ', response.type);
                    
                                if (response.didCancel) {
                                    console.log('User cancelled image picker');
                                } else if (response.error) {
                                    console.log('ImagePicker Error: ', response.error);
                                } else if (response.customButton) {
                                    console.log('User tapped custom button: ', response.customButton);
                                } else {
                                    this.setState({
                                        selected_upload_image: response.uri
                                    })
                                }
                            });
                        }
                    }}
                />
                <Modal style = {{width: '100%', height: '100%', }} visible = {this.state.visibleModal} transparent>
                {
                    this.state.loading &&
                    <ProgressIndicator/>
                }
                    <DateTimePickerModal
                        isVisible={this.state.isDatePickerVisible}
                        mode="datetime"
                        onConfirm={(date) => this.setState({selected_date: moment(date).format(), isDatePickerVisible: false})}
                        onCancel={() => this.setState({isDatePickerVisible: false})}
                        // date = {this.state.selected_index == -1 ? new Date() : new Date(this.state.user_schedules[this.state.selected_index].date)}
                        date = {new Date(this.state.selected_date)}
                    />
                    <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.grey, opacity: 0.3,}}/>
                    <View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <View style = {{width: '90%', borderRadius: 10, overflow: 'hidden'}}>
                            <View style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Colors.primary}}>
                                <Text style = {{fontSize: 16, color: Colors.white}}>{"Create New Sponsorship"}</Text>
                            </View>
                            <View style = {{paddingHorizontal: 15, backgroundColor: Colors.white}}>
                                <View style = {styles.component_view}>
                                    <TextInput style = {styles.text_input} placeholder = {"Title*"} placeholderTextColor = {Colors.grey}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                selected_title: text
                                            })
                                        }}
                                    >{this.state.selected_title}</TextInput>
                                </View>
                                <View style = {styles.component_view}>
                                    <TextInput style = {styles.text_input} placeholder = {"Location*"} placeholderTextColor = {Colors.grey}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                selected_location: text
                                            })
                                        }}
                                    >{this.state.selected_location}</TextInput>
                                </View>
                                <View style = {styles.component_view}>
                                    <TouchableOpacity style = {{width: '100%', height: '100%', justifyContent: 'center'}} onPress = {() => this.setState({isDatePickerVisible: true})}>
                                        <Text style = {[styles.text_input, {height: null}]} placeholder = {"Date*"} placeholderTextColor = {Colors.grey}>{moment(this.state.selected_date).format("MMM DD. yyyy h:mm a")}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style = {styles.component_view}>
                                    <TextInput style = {styles.text_input} placeholder = {"Link"} placeholderTextColor = {Colors.grey}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                selected_link: text
                                            })
                                        }}
                                    >{this.state.selected_link}</TextInput>
                                </View>
                                <View style = {[styles.component_view, {height: 100}]}>
                                    <TextInput style = {styles.text_input} placeholder = {"Description"} placeholderTextColor = {Colors.grey} multiline = {true}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                selected_desc: text
                                            })
                                        }}
                                    >{this.state.selected_desc}</TextInput>
                                </View>
                                <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 20}}>
                                    <TouchableOpacity style = {[styles.button_style, {backgroundColor: Colors.primary}]} onPress = {() => this.scheduleEditCreate()}>
                                        <Text style = {{fontSize: 16, color: Colors.white}}>{"SAVE"}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {[styles.button_style, ]} onPress = {() => this.setState({visibleModal: false})}>
                                        <Text style = {{fontSize: 16, color: Colors.primary}}>{"CANCEL"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
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
                                }, () => this.getSchedules()) 
                            }}>
                            {this.state.search_text}
                        </TextInput>
                    </View>
                </View>
                
                <View style = {{flex: 1, alignItems: 'center',}}>
                {
                    !this.state.loading && this.state.schedule_array.length == 0 &&
                    <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style = {{fontSize: 18, color: Colors.primary}}>{"There are no Schedules"}</Text>
                    </View>
                }
                    <FlatList
                        onRefresh={() => this.refreshSchedules()}
                        style = {{width: '100%'}}
                        refreshing={this.state.refreshing}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                            if(!this.onEndReachedCalledDuringMomentum && this.state.more_load && !this.state.refreshing) {
                                this.onEndReachedCalledDuringMomentum = true;
                                this.getSchedules();
                            }
                        }}
                        data={this.state.schedule_array}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                        renderItem={({ item, index }) => <ScheduleCard key = {index} style = {{marginTop: 15}} data = {item} navigation = {this.props.navigation} deleteSchedule = {this.deleteSchedulePopUp} editSchedule={this.editSchedule} openModal = {this.openModal}/>}
                    >
                    </FlatList>
                </View>
            {
                this.state.user_role == "ADMIN" &&
                <View style = {{position: 'absolute', bottom: 20, right: 20, }}>
                    <TouchableOpacity style = {{width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.openModal(null)}>
                        <Image style = {{width: 30, height: 30, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/plus.png')}></Image>
                    </TouchableOpacity>
                </View>
            }
            </Container>
        )
    }
}

const styles = StyleSheet.create({
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