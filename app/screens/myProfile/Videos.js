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
    ActivityIndicator,
    Modal
 } from "react-native";

import { Colors } from '../../utils/Colors';
import { stylesGlobal } from '../../Global/stylesGlobal';
import ProgressIndicator from "../../components/ProgressIndicator";
import * as Global from "../../Global/Global";
import WebService from "../../utils/WebService";
import { Constants } from "../../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalDropdown from "../../components/react-native-modal-dropdown/ModalDropdown";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from '../../components/react-native-actionsheet';
import FastImage from 'react-native-fast-image';
import { WebView } from 'react-native-webview';
import VideoPlayer from 'react-native-video-player';

export default class Videos extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            my_profile: this.props.my_profile,
            my_videos: this.props.my_videos || [],
            comment_text: "Add 1 highlight film and at least 1 workout training video",
            upload_video: '',
            external_link: '',
            deleteVideo: '',
            selected_description: '',
            selected_highlight: 0,
            selected_workout: 0,
            visibleModalEdit: false
        }

        this._video = [];

    }

    async UNSAFE_componentWillMount() {
        console.log(JSON.stringify(this.state.my_videos))
    }

    uploadVideo = async(type) => {
        try {
            this.props.setLoading(true);
            var uri = Global.BASE_URL + "/api/resources";
            var params = new FormData();

            if(type == 'local') {
                let localUriTypePart = this.state.upload_video.split('.');
                let fileType = localUriTypePart[localUriTypePart.length - 1];
                const newImage = {
                    uri: this.state.upload_video,
                    name: "property_image." + fileType,
                    type: `video/${fileType}`,
                }
                params.append("file", newImage);
            } else {
                if(this.state.external_link == "") {
                    Alert.alert(Constants.warnning, "Please input video link");
                    this.props.setLoading(false);
                    return;
                }
                params.append("link", this.state.external_link);
            }
            
            params.append("type", "VIDEO");
            params.append("user_id", this.state.my_profile.id);
                                                
            console.log(" callUploadVideoAPI uri " + uri);
            console.log(" callUploadVideoAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleUploadVideoAPI);
        } catch (error) {
            this.props.setLoading(false);
        }
    }

    handleUploadVideoAPI = async(response, isError) => {
        console.log(" callUploadVideoAPI Response " + JSON.stringify(response));
        console.log(" callUploadVideoAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.setState({
                        my_videos: [...this.state.my_videos, response.resources[0]],
                        external_link: ''
                    })
                } else {
                    
                }
            } else {
                
            }
        } catch(error) {
            
        }
        this.props.setLoading(false);
    }

    deleteVideoPopup = async(index) => {
        Alert.alert("Are your sure to delete", "You can't recover it",
        [
            {text: 'OK', onPress: () => {
                this.deleteVideo(index)
            }},
            {text: 'Cancel', onPress: () => null},
        ],
            {cancelable: false}
        )
    }

    deleteVideo = async(index) => {
        try {
            this.props.setLoading(true);
            this.setState({
                selected_index: index
            });
            
            var uri = Global.BASE_URL + "/api/resource/" + this.state.my_videos[index].id;
                                                
            console.log(" callDeleteVideoAPI uri " + uri);

            WebService.callServiceDelete(uri, this.handleDeleteVideoAPI);
        } catch (error) {
            console.log(error)
            this.props.setLoading(false);
        }
    }

    handleDeleteVideoAPI = async(response, isError) => {
        console.log(" callDeleteVideoAPI Response " + JSON.stringify(response));
        console.log(" callDeleteVideoAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    var my_videos = this.state.my_videos;
                    my_videos.splice(this.state.selected_index, 1)
                    this.setState({
                        my_videos: my_videos
                    })
                }
            } else {
                
            }
        } catch(error) {
            console.log("signin catch error", error);
        }
        this.props.setLoading(false);
    }

    openEditModal = (index) => {
        this.setState({
            selected_index: index, 
            selected_description: this.state.my_videos[index].description == null ? '' : this.state.my_videos[index].description,
            selected_highlight: this.state.my_videos[index].highlight == null ? 0 : this.state.my_videos[index].highlight,
            selected_workout: this.state.my_videos[index].workout == null ? 0 : this.state.my_videos[index].workout,
            visibleModalEdit: true
        })
    }

    saveAttribute = async() => {
        try {
            this.setState({
                loading: true
            })
                        
            var uri = Global.BASE_URL + "/api/resource/" + this.state.my_videos[this.state.selected_index].id;
            var params = JSON.stringify({
                description: this.state.selected_description,
                highlight: this.state.selected_highlight,
                workout: this.state.selected_workout
            })
                                                
            console.log(" callChangeAttributeAPI uri " + uri);

            WebService.callServicePut(uri, params, this.handleChangeAttributeAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: true
            })
        }
    }

    handleChangeAttributeAPI = async(response, isError) => {
        console.log(" callChangeAttributeAPI Response " + JSON.stringify(response));
        console.log(" callChangeAttributeAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    var my_videos = this.state.my_videos;
                    my_videos[this.state.selected_index].description = this.state.selected_description;
                    my_videos[this.state.selected_index].highlight = this.state.selected_highlight;
                    my_videos[this.state.selected_index].workout = this.state.selected_workout;
                    this.setState({
                        my_videos: my_videos,
                        visibleModalEdit: false
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

    render() {
        return (
            <View style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 15}}>
                <ActionSheet
                    ref={o => this.SelectImageActionSheet = o}
                    title={"Select Video"}
                    options={["Select from Camera", "Select from Library", "Cancel"]}
                    cancelButtonIndex={2}
                    // destructiveButtonIndex={1}
                    onPress={(index) => { 
                        var options = {
                            mediaType: 'video',
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
                                        upload_video: response.uri
                                    }, () => this.uploadVideo('local'))
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
                                        upload_video: response.uri
                                    }, () => this.uploadVideo('local'))
                                }
                            });
                        }
                    }}
                />
                <Text style = {{width: '100%', fontSize: 16, color: Colors.primary, textAlign: 'center', lineHeight: 20}}>{this.state.comment_text}</Text>
                <View style = {{width: '100%', height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, marginTop: 10}} onPress = {() => this.SelectImageActionSheet.show()}>
                    <TouchableOpacity style = {{height: '100%', width: 60, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.SelectImageActionSheet.show()}>
                        <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../../assets/images/uploadtocloud.png')}></Image>
                    </TouchableOpacity>
                    <TextInput style = {{flex: 1, fontSize: 14, color: Colors.primary, }} placeholder = {"Enter a link"} placeholderTextColor = {Colors.grey} onChangeText = {(text) => this.setState({external_link: text})}>{this.state.external_link}</TextInput>
                    <TouchableOpacity style = {{height: 30, width: 60, alignItems: 'center', justifyContent: 'center', borderStartColor: Colors.grey, borderStartWidth: 0.5}} onPress = {() => this.uploadVideo('link')}>
                        <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../../assets/images/link_add.png')}></Image>
                    </TouchableOpacity>
                </View>
            {
                this.state.my_videos != null && this.state.my_videos.map((item, index) => 
                <View key = {index} style = {{width: '100%', aspectRatio: 1, marginVertical: 10, alignItems: 'center', justifyContent: 'center'}}>
                    <View style = {{width: '100%', height: 50, position: 'absolute', top: 0, left: 0, zIndex: 10, elevation: 10, flexDirection: 'row', alignItems: 'center'}}>
                        <View style = {{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, backgroundColor: Colors.primary, opacity: 0.3, }}/>
                        <ModalDropdown 
                            dropdownStyle = {{width: 100, height: 40 * 2}}
                            defaultIndex = {0}
                            options = {["Edit", "Delete"]}
                            onSelect = {(index_dropdown) => {
                                if(index_dropdown == 0) {
                                    this.openEditModal(index)
                                } else if(index_dropdown == 1) {
                                    this.deleteVideoPopup(index)
                                }
                            }}
                            renderButton = {() => {
                                return (
                                    <View style = {{height: '100%', width: 50, alignItems: 'center', justifyContent: 'center'}}>
                                        <Image style = {{width: 30, height: 30, resizeMode: 'contain', tintColor: Colors.white}} source = {require('../../assets/images/menu_vertical.png')}></Image>
                                    </View>
                                )
                            }}
                            renderRow = {(item, index, highlighted) => {
                                return (
                                    <View key = {index} style = {{width: 100, height: 40, flexDirection: 'row', alignItems: 'center', paddingStart: 10}}>
                                        <Text style = {{fontSize: 14, color: Colors.grey, marginStart: 10}}>{item}</Text>
                                    </View>
                                )
                            }}
                        />
                        <Text style = {{fontSize: 14, color: Colors.white, marginStart: 10}} >{item.description == null ? "" : item.description}</Text>
                    </View>
                    <View style = {{width: '100%', aspectRatio: 1}}>
                    {
                        item.url != null && item.url.substring(0, 4).toLowerCase() == "http" &&
                        <WebView
                            javaScriptEnabled={true}
                            scrollEnabled={false}
                            allowsFullscreenVideo={true}
                            source={{ uri: item.url}}
                            style = {{width: '100%', height: '100%'}}
                        />
                    }
                    {
                        item.url != null && item.url.substring(0, 4).toLowerCase() != "http" &&
                        <VideoPlayer
                            ref={(ref) => this._video[index] = ref}
                            // videoWidth={height * 0.7}
                            // videoHeight={height * 0.7}
                            autoplay = {false}
                            pauseOnPress = {true}
                            video={{uri: Global.BASE_URL + item.url}}
                            // resizeMode='cover'
                            onLoad={() => {
                                // this._video[index].seek(0);
                                // this._video[index].pause();
                            }}
                            onPlayPress={() => {
                                this._video[index].resume();
                            }}
                            style = {{width: '100%', height: '100%', }}
                        />
                    }
                    </View>
                </View>
                )
            }
                <Modal style = {{width: '100%', height: '100%', }} visible = {this.state.visibleModalEdit} transparent>
                {
                    this.state.loading &&
                    <ProgressIndicator/>
                }
                    <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.grey, opacity: 0.3,}}/>
                    <View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <View style = {{width: '90%', borderRadius: 10, overflow: 'hidden'}}>
                            <View style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Colors.primary}}>
                                <Text style = {{fontSize: 16, color: Colors.white}}>{"Edit Attribute"}</Text>
                            </View>
                            <View style = {{paddingHorizontal: 15, backgroundColor: Colors.white}}>
                                <TextInput style = {{width: '100%', height: 40, fontSize: 16, color: Colors.primary, borderBottomColor: Colors.grey, borderBottomWidth: 1, marginTop: 20}} placeholder = {"Description"} placeholderTextColor = {Colors.grey} onChangeText = {(text) => this.setState({selected_description: text})}>
                                    {this.state.selected_description == null ? "" : this.state.selected_description}
                                </TextInput>
                                <View style = {{width: '100%', flexDirection: 'row', marginTop: 20}}>
                                    <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center'}} onPress = {() => {
                                        if(this.state.selected_highlight == 0) {
                                            this.setState({
                                                selected_highlight: 1
                                            })
                                        } else {
                                            this.setState({
                                                selected_highlight: 0
                                            })
                                        }
                                    }}>
                                    {
                                        this.state.selected_highlight == 0 &&
                                        <Image style = {{width: 20, height: 20, tintColor: Colors.primary}} resizeMode = {'contain'} source={require('../../assets/images/message_uncheck.png')}/>
                                    }
                                    {
                                        this.state.selected_highlight == 1 &&
                                        <Image style = {{width: 20, height: 20, tintColor: Colors.secondary}} resizeMode = {'contain'} source={require('../../assets/images/message_check.png')}/>
                                    }
                                        <Text style = {{fontSize: 16, color: Colors.grey, marginStart: 10}}>{"Highlight"}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {{flexDirection: 'row', alignItems: 'center', marginStart: 15}} onPress = {() => {
                                        if(this.state.selected_workout == 0) {
                                            this.setState({
                                                selected_workout: 1
                                            })
                                        } else {
                                            this.setState({
                                                selected_workout: 0
                                            })
                                        }
                                    }}>
                                    {
                                        this.state.selected_workout == 0 &&
                                        <Image style = {{width: 20, height: 20, tintColor: Colors.primary}} resizeMode = {'contain'} source={require('../../assets/images/message_uncheck.png')}/>
                                    }
                                    {
                                        this.state.selected_workout == 1 &&
                                        <Image style = {{width: 20, height: 20, tintColor: Colors.secondary}} resizeMode = {'contain'} source={require('../../assets/images/message_check.png')}/>
                                    }
                                        <Text style = {{fontSize: 16, color: Colors.grey, marginStart: 10}}>{"Workout"}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style = {{width: '100%', flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, marginBottom: 15}}>
                                    <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primary}} onPress = {() => this.saveAttribute()}>
                                        <Text style = {{fontSize: 16, color: Colors.white}}>{"SAVE"}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, borderWidth: 1, borderColor: Colors.primary, marginStart: 15}} onPress = {() => this.setState({visibleModalEdit: false})}>
                                        <Text style = {{fontSize: 16, color: Colors.primary}}>{"CANCEL"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal> 
            </View>
        )
    }
}

const styles = StyleSheet.create({
    
})