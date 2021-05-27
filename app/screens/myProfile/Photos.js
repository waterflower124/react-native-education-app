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
import Gallery from '../../components/react-native-image-gallery/Gallery';
import {Pagination} from "../../components/react-native-image-gallery/Pagination"

export default class Photos extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            my_profile: this.props.my_profile,
            my_photos: this.props.my_photos || [],
            comment_text: "Please take one picture in a door frame and 1 showing wing span. If available, take door picture next to a tape measure. This will help coaches verify your height and help with your player ranking.",
            upload_image: '',
            visibleModalGallery: false,
            initial_index: 0,

            deleteImage: '',
            visibleModalEdit: false,
            selected_description: '',
            selected_highlight: 0,
            selected_workout: 0,
        }

        // {
        //     "profile": {
        //       "id": 114,
        //       "user_id": 114,
        //       "ncaa": null,
        //       "city": null,
        //       "state": null,
        //       "zipcode": null,
        //       "twitter": null,
        //       "description": null,
        //       "current_school": null,
        //       "year": null,
        //       "position": null,
        //       "height": null,
        //       "weight": null,
        //       "hs_college": null,
        //       "act": null,
        //       "sat": null,
        //       "hs_gpa": null,
        //       "college_gpa": null,
        //       "created_at": "2021-03-31T19:38:01.000Z",
        //       "updated_at": "2021-03-31T19:38:01.000Z",
        //       "email": "Test@email.com",
        //       "name": "Test user",
        //       "avatar": null,
        //       "role": "PLAYER",
        //       "status": "DISABLE",
        //       "is_top": 0,
        //       "member": null
        //     },
        //     "resources": [
              
        //     ]
        // }
    }

    async UNSAFE_componentWillMount() {
        
    }

    uploadImage = async() => {
        try {
            this.props.setLoading(true);
            var uri = Global.BASE_URL + "/api/resources";
            let localUriTypePart = this.state.upload_image.split('.');
            let fileType = localUriTypePart[localUriTypePart.length - 1];
            const newImage = {
                uri: this.state.upload_image,
                name: "property_image." + fileType,
                type: `image/${fileType}`,
            }
            var params = new FormData();
            params.append("file", newImage);
            params.append("type", "IMAGE");
            params.append("user_id", this.state.my_profile.id);
                                                
            console.log(" callUploadImageAPI uri " + uri);
            console.log(" callUploadImageAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleUploadImageAPI);
        } catch (error) {
            this.props.setLoading(false);
        }
    }

    handleUploadImageAPI = async(response, isError) => {
        console.log(" callUploadImageAPI Response " + JSON.stringify(response));
        console.log(" callUploadImageAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.setState({
                        my_photos: [...this.state.my_photos, response.resources[0]]
                    })
                } else {
                    
                }
            } else {
                
            }
        } catch(error) {
            
        }
        this.props.setLoading(false);
    }

    goTo = index => {
        this.setState({ 
            initial_index: index 
        });
    };

    deleteImagePopup = async(index) => {
        Alert.alert("Are your sure to delete", "You can't recover it",
        [
            {text: 'OK', onPress: () => {
                this.deleteImage(index)
            }},
            {text: 'Cancel', onPress: () => null},
        ],
            {cancelable: false}
        )
    }

    deleteImage = async(index) => {
        try {
            this.props.setLoading(true);
            this.setState({
                selected_index: index
            });
            
            var uri = Global.BASE_URL + "/api/resource/" + this.state.my_photos[index].id;
                                                
            console.log(" callDeleteImageAPI uri " + uri);

            WebService.callServiceDelete(uri, this.handleDeleteImageAPI);
        } catch (error) {
            console.log(error)
            this.props.setLoading(false);
        }
    }

    handleDeleteImageAPI = async(response, isError) => {
        console.log(" callDeleteImageAPI Response " + JSON.stringify(response));
        console.log(" callDeleteImageAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    var my_photos = this.state.my_photos;
                    my_photos.splice(this.state.selected_index, 1)
                    this.setState({
                        my_photos: my_photos
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
            selected_description: this.state.my_photos[index].description == null ? '' : this.state.my_photos[index].description,
            selected_highlight: this.state.my_photos[index].highlight == null ? 0 : this.state.my_photos[index].highlight,
            selected_workout: this.state.my_photos[index].workout == null ? 0 : this.state.my_photos[index].workout,
            visibleModalEdit: true
        })
    }

    saveAttribute = async() => {
        try {
            this.setState({
                loading: true
            })
                        
            var uri = Global.BASE_URL + "/api/resource/" + this.state.my_photos[this.state.selected_index].id;
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
                    var my_photos = this.state.my_photos;
                    my_photos[this.state.selected_index].description = this.state.selected_description;
                    my_photos[this.state.selected_index].highlight = this.state.selected_highlight;
                    my_photos[this.state.selected_index].workout = this.state.selected_workout;
                    this.setState({
                        my_photos: my_photos,
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
            <View style = {{flex: 1, width: '100%', paddingHorizontal: 15, paddingVertical: 15}}>
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
                                        upload_image: response.uri
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
                                        upload_image: response.uri
                                    }, () => this.uploadImage())
                                }
                            });
                        }
                    }}
                />
                <Text style = {{width: '100%', fontSize: 16, color: Colors.primary, textAlign: 'center', lineHeight: 20}}>{this.state.comment_text}</Text>
                <TouchableOpacity style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, marginTop: 10}} onPress = {() => this.SelectImageActionSheet.show()}>
                    <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../../assets/images/uploadtocloud.png')}></Image>
                    <Text style = {{fontSize: 14, color: Colors.primary, marginStart: 20}}>{"Upload Image"}</Text>
                </TouchableOpacity>
            {
                this.state.my_photos != null && this.state.my_photos.map((item, index) => 
                <View key = {index} style = {{width: '100%', marginTop: 15}}>
                {
                    item.description != null && item.description != "" &&
                    <View style = {{width: '100%', padding: 10, backgroundColor: '#e8e8e8'}}>
                        <Text style = {{width: '100%', fontSize: 16, color: Colors.primary,}}>{item.description}</Text>
                    </View>
                }
                    <TouchableOpacity style = {{width: '100%', aspectRatio: 1}} activeOpacity = {1} onPress = {() => this.setState({initial_index: index, visibleModalGallery: true})}>
                        <FastImage style = {{width: '100%', height: '100%'}} source = {{uri: Global.BASE_URL + item.url}}
                            onLoadStart={() => {
                                var my_photos = this.state.my_photos;
                                my_photos[index].imageLoading = true;
                                this.setState({
                                    my_photos: my_photos
                                })
                            }}
                            
                            onLoad={(e) => {
                                var my_photos = this.state.my_photos;
                                my_photos[index].imageLoading = false;
                                this.setState({
                                    my_photos: my_photos
                                })
                            }}
                            onError={() => {
                                var my_photos = this.state.my_photos;
                                my_photos[index].imageLoading = true;
                                this.setState({
                                    my_photos: my_photos
                                })
                            }}
                        />
                    {
                        item.imageLoading &&
                        <View style = {{position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                            <ActivityIndicator color = {Colors.grey} size="large" />
                        </View>
                    }
                        <View style = {{position: 'absolute', bottom: 10, right: 10, flexDirection: 'row'}}>
                            <TouchableOpacity style = {{padding: 5, }} onPress = {() => this.openEditModal(index)}>
                                <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../../assets/images/edit.png')}></Image>
                            </TouchableOpacity>
                            <TouchableOpacity style = {{padding: 5, marginStart: 10}} onPress = {() => this.deleteImagePopup(index)}>
                                <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../../assets/images/delete.png')}></Image>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
                )
            }
                <Modal style = {{width: '100%', height: '100%', backgroundColor: Colors.white}} visible = {this.state.visibleModalGallery}>
                    <TouchableOpacity style = {{position: 'absolute', padding: 10, top: 25, left: 25, zIndex: 10, elevation: 10}} onPress = {() => this.setState({visibleModalGallery: false})}>
                        <Image style = {{width: 20, height: 20, tintColor: Colors.primary}} resizeMode = {'contain'} source={require('../../assets/images/close.png')}/>
                    </TouchableOpacity>
                    <View style = {{flex: 1}}>
                        <Gallery
                            images={this.state.my_photos}
                            initialPage = {this.state.initial_index}
                            onPageScroll = {(event) => this.setState({initial_index: event.position})}
                        />
                        <Pagination
                            index={this.state.initial_index}
                            data={this.state.my_photos}
                            initialPaginationSize={this.state.my_photos.length || 10}
                            goTo={this.goTo}
                        />
                    </View>
                </Modal>
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