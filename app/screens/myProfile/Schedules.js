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
    Modal
 } from "react-native";

import { Colors } from '../../utils/Colors';
import { stylesGlobal } from '../../Global/stylesGlobal';
import ProgressIndicator from "../../components/ProgressIndicator";
import * as Global from "../../Global/Global";
import WebService from "../../utils/WebService";
import { Constants } from "../../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default class Schedules extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            my_profile: this.props.my_profile,
            user_schedules: [],
            

            visibleModal: false,
            selected_index: -1,

            selected_title: '',
            selected_location: '',
            selected_date: moment(new Date()).format(),
            selected_link: '',
            selected_desc: '',

            isDatePickerVisible: false,
        }

    }

    async UNSAFE_componentWillMount() {
        this.getSchedules()

        console.log(moment('2018-10-03T05:00:00.000+0000').format('yyyy'))
    }

    getSchedules = async() => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/user_schedules/" + this.state.my_profile.id;
                                                
            console.log(" callGetSchedulesAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetSchedulesAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleGetSchedulesAPI = async(response, isError) => {
        console.log(" callGetSchedulesAPI Response " + JSON.stringify(response));
        console.log(" callGetSchedulesAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.setState({
                        user_schedules: response.schedules
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

    openModal = (index) => {
        if(index != -1) {
            this.setState({
                selected_title: this.state.user_schedules[index].title,
                selected_location: this.state.user_schedules[index].location,
                selected_date: this.state.user_schedules[index].date,
                selected_link: this.state.user_schedules[index].link,
                selected_desc: this.state.user_schedules[index].desc,
                selected_index: index
            })
        } else {
            this.setState({
                selected_index: -1,

                selected_title: '',
                selected_location: '',
                selected_date: moment(new Date()).format(),
                selected_link: '',
                selected_desc: '',
            })
        }
        this.setState({
            visibleModal: true
        })
    }

    deleteSchedulePopup = async(index) => {
        Alert.alert("Are your sure to delete", "You can't recover it",
        [
            {text: 'OK', onPress: () => {
                this.deleteSchedule(index)
            }},
            {text: 'Cancel', onPress: () => null},
        ],
            {cancelable: false}
        )
    }

    deleteSchedule = async(index) => {
        try {
            this.setState({
                loading: true,
                selected_index: index
            });
            
            var uri = Global.BASE_URL + "/api/schedule/" + this.state.user_schedules[this.state.selected_index].id;
                                                
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
                    var user_schedules = this.state.user_schedules;
                    user_schedules.splice(this.state.selected_index, 1)
                    this.setState({
                        user_schedules: user_schedules
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
                user_id: this.state.my_profile.id,
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
                        this.getSchedules();
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
            loading: false
        })
    }

    render() {
        return (
            <View style = {{width: '100%', paddingHorizontal: 15, paddingTop: 15}}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
            {
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
                                <Text style = {{fontSize: 16, color: Colors.white}}>{this.state.selected_index == -1 ? "Add New Schedule" : "Edit Schedule"}</Text>
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
            }
            {
                !this.state.loading && this.state.user_schedules.length == 0 &&
                <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: Colors.primary}}>{"There is no Schedules"}</Text>
                </View>
            }
            {
                this.state.user_schedules.length > 0 && this.state.user_schedules.map((item, index) => 
                <View key = {index} style = {{width: '100%', backgroundColor: Colors.white, marginBottom: 15}}>
                    <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 5, paddingVertical: 10, paddingHorizontal: 15, }}>
                        <View style = {{flex: 1}}>
                            <Text style = {{fontSize: 16, color: Colors.primary}}>{item.title == null ? "" : item.title}</Text>
                            <Text style = {{fontSize: 14, color: Colors.grey, marginTop: 5}}>{item.location == null ? "---" : item.location}</Text>
                            <Text style = {{fontSize: 14, color: Colors.date_color, marginTop: 5}}>{moment(item.date).format("MMM DD. yyyy h:mm a")}</Text>
                        </View>
                        <View style = {{flexDirection: 'row', alignItems: 'center'}}>
                            <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.openModal(index)}>
                                <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.secondary}} source = {require('../../assets/images/edit.png')}></Image>
                            </TouchableOpacity>
                            <TouchableOpacity style = {{width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginStart: 10}} onPress = {() => this.deleteSchedulePopup(index)}>
                                <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../../assets/images/delete.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                {
                    item.desc != null && item.desc != "" &&
                    <View style = {{width: '100%', paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: Colors.grey, paddingHorizontal: 15, }}>
                        <Text style = {{fontSize: 14, color: Colors.primary}}>{item.desc}</Text>
                    </View>
                }
                </View>
                )
            }
            </View>
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