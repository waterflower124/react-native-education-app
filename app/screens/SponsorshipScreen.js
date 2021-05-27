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
    Keyboard
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
import SponsorshipCard from '../components/SponsorshipCard';
import ScheduleCard from '../components/ScheduleCard';
import { buildQuery } from '../utils/utils';
import ModalDropdown from "../components/react-native-modal-dropdown/ModalDropdown";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from '../components/react-native-actionsheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

var TAG = "SponsorshipScreen";

export default class SponsorshipScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            loading: false,
            refreshing: false,
            sponsorship_array: [],
            page_number: 0,
            limit: 10,
            search_text: '',

            add_newgame_popup: false,
            selected_upload_image: '',
            selected_item: null,
        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        this.getSponsorship();
    }

    getSponsorship = async() => {
        try {
            if(!this.state.refreshing) {
                this.setState({
                    loading: true,
                });
            }
            
            var query = buildQuery({
                search: this.state.search_text,
            });
            
            var uri = Global.BASE_URL + "/api/sponsorships" + query;
                                                
            console.log(TAG + " callGetSponsorshipAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetSponsorshipAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    }

    handleGetSponsorshipAPI = async(response, isError) => {
        console.log(TAG + " callGetSponsorshipAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetSponsorshipAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    if(this.state.refreshing) {
                        this.setState({
                            sponsorship_array: response.sponsorships
                        })
                    } else {
                        this.setState({
                            sponsorship_array: [...this.state.sponsorship_array, ...response.sponsorships]
                        })
                    }
                    if(response.sponsorships.length < this.state.limit) {
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

    refreshGames = async() => {
        this.setState({
            refreshing: true,
            page_number: 0,
            more_load: true,
        }, () => this.getSponsorship())
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

    addNewGame = async() => {
        if(this.state.selected_title == '') {
            Alert.alert(Constants.warnning, Constants.game_title_error);
            return;
        }
        if(!this.isURL(this.state.selected_link)) {
            Alert.alert(Constants.warnning, Constants.game_link_error);
            return;
        }
        try {
            this.setState({
                loading: true
            })
            var uri = Global.BASE_URL + "/api/game";
            let localUriTypePart = this.state.selected_upload_image.split('.');
            let fileType = localUriTypePart[localUriTypePart.length - 1];
            const newImage = {
                uri: this.state.selected_upload_image,
                name: "property_image." + fileType,
                type: `image/${fileType}`,
            }
            var params = new FormData();
            params.append("title", this.state.selected_title);
            params.append("link", this.state.selected_link);
            params.append("image", newImage)
                                    
            console.log(" callNewGameAPI uri " + uri);
            console.log(" callNewGameAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleNewGameAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleNewGameAPI = async(response, isError) => {
        console.log(" callNewGameAPI Response " + JSON.stringify(response));
        console.log(" callNewGameAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    this.setState({
                        add_newgame_popup: false,
                        refreshing: true
                    })
                    this.getSponsorship();
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

    deleteSponsorshipPopUp = async(item) => {
        Alert.alert(Constants.delete_alert_title, Constants.delete_alert_message,
        [
            {text: 'OK', onPress: () => {
                this.deleteGame(item)
            }},
            {text: 'Cancel', onPress: () => null},
        ],
            {cancelable: false}
        )
    }

    deleteSponsorship = async(item) => {
        try {
            this.setState({
                loading: true,
                selected_item: item
            });
            
            var uri = Global.BASE_URL + "/api/sponsorship/" + item.id;
                                                
            console.log(" callDeleteSponsorshipAPI uri " + uri);

            WebService.callServiceDelete(uri, this.handleDeleteSponsorshipAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleDeleteSponsorshipAPI = async(response, isError) => {
        console.log(" callDeleteSponsorshipAPI Response " + JSON.stringify(response));
        console.log(" callDeleteSponsorshipAPI isError " + isError);
        try {
            if(!isError) {
                if(response.success) {
                    var sponsorship_array = this.state.sponsorship_array;
                    for(var i = 0; i < sponsorship_array.length; i ++) {
                        if(sponsorship_array[i].id == this.state.selected_item.id) {
                            sponsorship_array.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({
                        sponsorship_array: sponsorship_array,
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
            {
                this.state.add_newgame_popup &&
                <View style = {{width: '100%', height: '100%', position: 'absolute', zIndex: 10}}>
                    <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.black, opacity: 0.3,}}/>
                    <View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <View style = {{width: '90%', borderRadius: 10, overflow: 'hidden'}}>
                            <KeyboardAwareScrollView>
                            <View style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Colors.primary}}>
                                <Text style = {{fontSize: 16, color: Colors.white}}>{"Add New Game"}</Text>
                            </View>
                            <View style = {{paddingHorizontal: 15, backgroundColor: Colors.white}}>
                            {
                                this.state.selected_upload_image != '' &&
                                <View style = {{width: '100%', aspectRatio: 1, marginTop: 15}}>
                                    <Image style = {{width: '100%', height: '100%', resizeMode: 'cover'}} source = {{uri: this.state.selected_upload_image}}></Image>
                                </View>
                            }
                                <TouchableOpacity style = {[styles.component_view, {flexDirection: 'row', alignItems: 'center'}]} onPress = {() => this.SelectImageActionSheet.show()}>
                                    <Image style = {{width: 20, height: 20, resizeMode: 'contain', tintColor: Colors.primary}} source = {require('../assets/images/uploadtocloud.png')}></Image>
                                    <Text style = {{fontSize: 14, color: Colors.primary, marginStart: 20}}>{"Upload Image"}</Text>
                                </TouchableOpacity>
                                <View style = {styles.component_view}>
                                    <TextInput style = {styles.text_input} placeholder = {"Link*"} placeholderTextColor = {Colors.grey}
                                        onChangeText = {(text) => {
                                            this.setState({
                                                selected_link: text
                                            })
                                        }}
                                    >{this.state.selected_link}</TextInput>
                                </View>
                                <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 20}}>
                                    <TouchableOpacity style = {[styles.button_style, {backgroundColor: Colors.primary}]} onPress = {() => this.addNewGame()}>
                                        <Text style = {{fontSize: 16, color: Colors.white}}>{"SAVE"}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style = {[styles.button_style, ]} onPress = {() => this.setState({selected_upload_image: '', selected_title: '', selected_link: '', add_newgame_popup: false})}>
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
                                }, () => this.getSponsorship()) 
                            }}>
                            {this.state.search_text}
                        </TextInput>
                    </View>
                </View>
                
                <View style = {{flex: 1, alignItems: 'center',}}>
                {
                    !this.state.loading && this.state.sponsorship_array.length == 0 &&
                    <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style = {{fontSize: 18, color: Colors.primary}}>{"There are no Sponsorship"}</Text>
                    </View>
                }
                    <FlatList
                        onRefresh={() => this.refreshGames()}
                        style = {{width: '100%'}}
                        refreshing={this.state.refreshing}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                            if(!this.onEndReachedCalledDuringMomentum && this.state.more_load && !this.state.refreshing) {
                                this.onEndReachedCalledDuringMomentum = true;
                                this.getSponsorship();
                            }
                        }}
                        data={this.state.sponsorship_array}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                        renderItem={({ item, index }) => <SponsorshipCard key = {index} style = {{marginTop: 15}} data = {item} navigation = {this.props.navigation} deleteSponsorship = {this.deleteSponsorshipPopUp}/>}
                    >
                    </FlatList>
                </View>
            {
                this.state.user_role == "ADMIN" &&
                <View style = {{position: 'absolute', bottom: 20, right: 20, }}>
                    <TouchableOpacity style = {{width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.setState({add_newgame_popup: true})}>
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