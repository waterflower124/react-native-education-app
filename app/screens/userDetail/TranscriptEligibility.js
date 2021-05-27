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
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from '../../components/react-native-actionsheet';
import ModalDropdown from "../../components/react-native-modal-dropdown/ModalDropdown";

export default class TranscriptEligibility extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            user_transcript: null,
            eligibilities: Constants.eligibilities,
            selected_eligibility_index: -1,
            modaldropdown_disable: false,
            selected_upload_image: ""
        }

    }

    async UNSAFE_componentWillMount() {
        this.getTranscript()
    }

    getTranscript = async() => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/transcript/" + this.props.profile_id;
                                                
            console.log(" callGetTranscriptAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetTranscriptAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleGetTranscriptAPI = async(response, isError) => {
        console.log(" callGetTranscriptAPI Response " + JSON.stringify(response));
        console.log(" callGetTranscriptAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    if(response.transcript != null) {
                        if(response.transcript.transcript != null && response.transcript.transcript != "") {
                            var transcript_file_array = response.transcript.transcript.split("/")
                            this.setState({
                                image_filename: transcript_file_array[transcript_file_array.length - 1]
                            })
                        }
                        
                        if(response.transcript.eligibility != null && response.transcript.eligibility != "") {
                            for(var i = 0; i < this.state.eligibilities.length; i ++) {
                                if(this.state.eligibilities[i].value == response.transcript.eligibility) {
                                    this.setState({
                                        selected_eligibility_index: i
                                    })
                                    break;
                                }
                            }
                        } else {
                            this.setState({
                                selected_eligibility_index: -1
                            })
                        }
                        this.setState({
                            user_transcript: response.transcript,
                        })
                    } else {
                        this.setState({
                            selected_eligibility_index: -1
                        })
                    }
                }
            } else {
                
            }
        } catch(error) {
            
        }
        this.setState({
            loading: false,
            refreshing: false
        })
    }

    uploadImage = () => {
        try {
            
            var uri = Global.BASE_URL + "/api/admin_transcript/" + this.props.profile_id;
            let localUriTypePart = this.state.selected_upload_image.split('.');
            let fileType = localUriTypePart[localUriTypePart.length - 1];
            const newImage = {
                uri: this.state.selected_upload_image,
                name: "property_image." + fileType,
                type: `image/${fileType}`,
            }
            var params = new FormData();
            params.append("file", newImage)
                                    
            console.log(" callUploadImageAPI uri " + uri);
            console.log(" callUploadImageAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleUploadImageAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleUploadImageAPI = async(response, isError) => {
        console.log(" callUploadImageAPI Response " + JSON.stringify(response));
        console.log(" callUploadImageAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.getTranscript();
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

    deleteImage = () => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/admin_transcript/" + this.props.profile_id;
            var params = JSON.stringify({
                transcript: ""
            })
                                                
            console.log(" callPutTranscriptImageAPI uri " + uri);
            console.log(" callPutTranscriptImageAPI params " + params);

            WebService.callServicePut(uri, params, this.handlePutTranscriptImageAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handlePutTranscriptImageAPI = async(response, isError) => {
        console.log(" callPutTranscriptImageAPI Response " + JSON.stringify(response));
        console.log(" callPutTranscriptImageAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.getTranscript();
                }
            } else {
                
            }
        } catch(error) {
            
        }
        this.setState({
            loading: false,
            refreshing: false
        })
    }

    setEligibility = async(index) => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/admin_transcript/" + this.props.profile_id;
            var params = null;
            if(index == -1) {
                params = JSON.stringify({
                    eligibility: ""
                })
            } else {
                params = JSON.stringify({
                    eligibility: this.state.eligibilities[index].value
                })
            }
                                                
            console.log(" callSetEligibilityAPI uri " + uri);
            console.log(" callSetEligibilityAPI params " + params);

            WebService.callServicePut(uri, params, this.handleSetEligibilityAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleSetEligibilityAPI = async(response, isError) => {
        console.log(" callSetEligibilityAPI Response " + JSON.stringify(response));
        console.log(" callSetEligibilityAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.getTranscript();
                }
            } else {
                
            }
        } catch(error) {
            
        }
        this.setState({
            loading: false,
            refreshing: false
        })
    }
    
    render() {
        return (
            <View style = {{width: '100%', padding: 20}}>
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
                                    }, () => this.uploadImage())
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
                                    }, () => this.uploadImage())
                                }
                            });
                        }
                    }}
                />
                <Text style = {{fontSize: 16, color: Colors.grey}}>{"Transcript"}</Text>
            {
                this.state.user_transcript != null && this.state.user_transcript.transcript != null && this.state.user_transcript.transcript != "" &&
                <View style = {{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                    <Text style = {{fontSize: 14, color: '#ff0000'}}>{this.state.image_filename}</Text>
                    {/* <TouchableOpacity>
                        <Image style = {{width: 20, height: 20, tintColor: Colors.grey, marginStart: 15}} resizeMode = {'contain'} source={require('../../assets/images/download.png')}/>
                    </TouchableOpacity> */}
                    <TouchableOpacity style = {{marginStart: 15}} onPress = {() => this.deleteImage()}>
                        <Image style = {{width: 20, height: 20, tintColor: Colors.grey}} resizeMode = {'contain'} source={require('../../assets/images/delete.png')}/>
                    </TouchableOpacity>
                </View>
            }
            {
                !(this.state.user_transcript != null && this.state.user_transcript.transcript != null && this.state.user_transcript.transcript != "") &&
                <TouchableOpacity style = {{width: 170, paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, marginTop: 10}} onPress = {() => this.SelectImageActionSheet.show()}>
                    <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../../assets/images/uploadtocloud.png')}></Image>
                    <Text style = {{fontSize: 14, color: Colors.primary, marginStart: 20}}>{"Upload Image"}</Text>
                </TouchableOpacity>
            }
            
                <Text style = {{fontSize: 16, color: Colors.grey, marginTop: 20}}>{"Eligibility"}</Text>
            {
                this.state.selected_eligibility_index != -1 &&
                <View style = {{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                    <Text style = {{fontSize: 14, color: Colors.primary}}>{this.state.eligibilities[this.state.selected_eligibility_index].value}</Text>
                    <TouchableOpacity style = {{marginStart: 40}} 
                        onPress = {() => {
                            this.setEligibility(-1)
                        }}>
                        <Image style = {{width: 20, height: 20, tintColor: Colors.grey}} resizeMode = {'contain'} source={require('../../assets/images/delete.png')}/>
                    </TouchableOpacity>
                </View>
            }
            {
                this.state.selected_eligibility_index == -1 &&
                <ModalDropdown 
                    dropdownStyle = {{width: Dimensions.get('window').width - 40, height: 40 * 6, backgroundColor: Colors.white}}
                    defaultIndex = {0}
                    options = {this.state.eligibilities}
                    onSelect = {(index) => {
                        this.setState({
                            selected_eligibility_index: index
                        }, () => this.setEligibility(index))
                    }}
                    style = {{marginTop: 10}}
                    renderButton = {() => {
                        return (
                            <View style = {styles.filter_item_container}>
                                <View style = {styles.filter_item_view}>
                                    <Text style = {styles.filter_item_text}>{this.state.selected_eligibility_index == -1 ? "Eligibility" : this.state.eligibilities[this.state.selected_eligibility_index].label}</Text>
                                    <View style = {{flex: 1, alignItems: 'flex-end', justifyContent: 'center',}}>
                                        <Image style = {styles.filter_item_dropdown_icon} resizeMode = {'contain'} source={require('../../assets/images/dropdown_triangle.png')}/>
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
            }
            </View>
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