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
    Modal } from "react-native";

import { Colors } from '../utils/Colors';
import { stylesGlobal } from '../Global/stylesGlobal';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ProgressIndicator from "../components/ProgressIndicator";
import * as Global from "../Global/Global";
import WebService from "../utils/WebService";
import { Constants } from "../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewsCard from '../components/NewsCard';
import { buildQuery } from '../utils/utils';
import ModalDropdown from "../components/react-native-modal-dropdown/ModalDropdown";
import Container from '../components/Container';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ActionSheet from '../components/react-native-actionsheet';

var TAG = "NewsScreen";

export default class NewsScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            loading: false,
            refreshing: false,
            news_array: [],
            page_number: 0,
            limit: 10,
            search_text: '',
            more_load: true,

            visibleModal: false,

            selected_item: null,
            selected_title: '',
            selected_link: '',
            selected_content: '',
            selected_upload_image: ''
        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        this.getNews();
    }

    getNews = async() => {
        try {
            if(!this.state.refreshing) {
                this.setState({
                    loading: true,
                });
            }
            
            query = buildQuery({
                search: this.state.search_text,
            });
            
            var uri = Global.BASE_URL + "/api/articles" + query;
                                                
            console.log(TAG + " callGetNewsAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetNewsAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
                refreshing: false
            });
        }
    }

    handleGetNewsAPI = async(response, isError) => {
        console.log(TAG + " callGetNewsAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetNewsAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    if(this.state.refreshing) {
                        this.setState({
                            news_array: response.articles
                        })
                    } else {
                        this.setState({
                            news_array: [...this.state.news_array, ...response.articles]
                        })
                    }
                    if(response.articles.length < this.state.limit) {
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

    refreshNews = async() => {
        this.setState({
            refreshing: true,
            page_number: 0,
            more_load: true,
        }, () => this.getNews())
    }

    deleteNewsPopUp = async(item) => {
        Alert.alert(Constants.delete_alert_title, Constants.delete_alert_message,
        [
            {text: 'OK', onPress: () => {
                this.deleteNews(item)
            }},
            {text: 'Cancel', onPress: () => null},
        ],
            {cancelable: false}
        )
    }

    deleteNews = async(item) => {
        try {
            this.setState({
                loading: true,
                selected_item: item
            });
            
            var uri = Global.BASE_URL + "/api/article/" + item.id;
                                                
            console.log(" callDeleteNewsAPI uri " + uri);

            WebService.callServiceDelete(uri, this.handleDeleteNewsAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleDeleteNewsAPI = async(response, isError) => {
        console.log(" callDeleteNewsAPI Response " + JSON.stringify(response));
        console.log(" callDeleteNewsAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    var news_array = this.state.news_array;
                    for(var i = 0; i < news_array.length; i ++) {
                        if(news_array[i].id == this.state.selected_item.id) {
                            news_array.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({
                        news_array: news_array,
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
                selected_item: null,

                selected_title: '',
                selected_link: '',
                selected_content: '',
                selected_upload_image: ''
            })
        } else {
            var index = 0;
            for(var i = 0; i < this.state.news_array.length; i ++) {
                if(this.state.news_array[i].id == item.id) {
                    index = i;
                    break
                }
            }
            this.setState({
                selected_title: this.state.news_array[index].title,
                selected_link: this.state.news_array[index].link,
                selected_content: this.state.news_array[index].content,
                selected_upload_image: '',
                selected_item: item
            })
        }
        
        this.setState({
            visibleModal: true
        })
    }

    newsEditCreate = async() => {
        try {
            if(this.state.selected_title.length == 0) {
                Alert.alert(Constants.warnning, Constants.schedule_title_error);
                return;
            }
            if(this.state.selected_content.length = 0) {
                Alert.alert(Constants.warnning, "Please input content");
                return;
            }
            
            this.setState({
                loading: true,
            });
            var uri = Global.BASE_URL + "/api/article";
            
            var params = new FormData();
            if(this.state.selected_upload_image != '') {
                let localUriTypePart = this.state.selected_upload_image.split('.');
                let fileType = localUriTypePart[localUriTypePart.length - 1];
                const newImage = {
                    uri: this.state.selected_upload_image,
                    name: "property_image." + fileType,
                    type: `image/${fileType}`,
                }
                
                params.append("image", newImage)
            }
            
            if(this.state.selected_item != null) {
                params.append("id", this.state.selected_item.id);
            } 
            params.append("title", this.state.selected_title);
            params.append("link", this.state.selected_link);
            params.append("content", this.state.selected_content)
                                    
            console.log(" callCreateEditNewsAPI uri " + uri);
            console.log(" callCreateEditNewsAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleEditCreateNewsAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleEditCreateNewsAPI = async(response, isError) => {
        console.log(" callCreateEditNewsAPI Response " + JSON.stringify(response));
        console.log(" callCreateEditNewsAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.setState({
                        visibleModal: false,
                        news_array: []
                    })
                    this.refreshNews()
                    
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
                    <View style = {{width: '100%', height: '100%', position: 'absolute', backgroundColor: Colors.grey, opacity: 0.3,}}/>
                    <View style = {{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <View style = {{width: '90%', borderRadius: 10, overflow: 'hidden'}}>
                            <KeyboardAwareScrollView>
                                <View style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: Colors.primary}}>
                                    <Text style = {{fontSize: 16, color: Colors.white}}>{this.state.selected_item == null ? "Add News" : "Edit News"}</Text>
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
                                        <TextInput style = {styles.text_input} placeholder = {"Title*"} placeholderTextColor = {Colors.grey}
                                            onChangeText = {(text) => {
                                                this.setState({
                                                    selected_title: text
                                                })
                                            }}
                                        >{this.state.selected_title}</TextInput>
                                    </View>
                                    <View style = {[styles.component_view, {height: 100}]}>
                                        <TextInput style = {styles.text_input} placeholder = {"Contents*"} placeholderTextColor = {Colors.grey} multiline = {true}
                                            onChangeText = {(text) => {
                                                this.setState({
                                                    selected_content: text
                                                })
                                            }}
                                        >{this.state.selected_content == null ? "" : this.state.selected_content}</TextInput>
                                    </View>
                                    <View style = {styles.component_view}>
                                        <TextInput style = {styles.text_input} placeholder = {"Link"} placeholderTextColor = {Colors.grey}
                                            onChangeText = {(text) => {
                                                this.setState({
                                                    selected_link: text
                                                })
                                            }}
                                        >{(this.state.selected_link == null || this.state.selected_link == 'null') ? "" : this.state.selected_link}</TextInput>
                                    </View>
                                    
                                    <View style = {{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 20}}>
                                        <TouchableOpacity style = {[styles.button_style, {backgroundColor: Colors.primary}]} onPress = {() => this.newsEditCreate()}>
                                            <Text style = {{fontSize: 16, color: Colors.white}}>{"SAVE"}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style = {[styles.button_style, ]} onPress = {() => this.setState({visibleModal: false})}>
                                            <Text style = {{fontSize: 16, color: Colors.primary}}>{"CANCEL"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                             </KeyboardAwareScrollView>
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
                                }, () => this.getNews()) 
                            }}>
                            {this.state.search_text}
                        </TextInput>
                    </View>
                </View>
                <View style = {{flex: 1, alignItems: 'center',}}>
                    <FlatList
                        onRefresh={() => this.refreshNews()}
                        style = {{width: '100%'}}
                        refreshing={this.state.refreshing}
                        onEndReachedThreshold={0.5}
                        onEndReached={() => {
                            if(!this.onEndReachedCalledDuringMomentum && this.state.more_load && !this.state.refreshing) {
                                this.onEndReachedCalledDuringMomentum = true;
                                this.getNews();
                            }
                        }}
                        data={this.state.news_array}
                        extraData={this.state}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                        renderItem={({ item, index }) => <NewsCard key = {index} style = {{marginTop: 15}} data = {item} navigation = {this.props.navigation} openModal = {this.openModal} deleteNews = {this.deleteNewsPopUp} editNews = {this.openModal} />}
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