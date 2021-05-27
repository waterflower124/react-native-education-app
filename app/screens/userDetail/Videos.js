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
    
 } from "react-native";

import { Colors } from '../../utils/Colors';
import { stylesGlobal } from '../../Global/stylesGlobal';
import ProgressIndicator from "../../components/ProgressIndicator";
import * as Global from "../../Global/Global";
import WebService from "../../utils/WebService";
import { Constants } from "../../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { isUrl } from '../../utils/utils';
import VideoPlayer from 'react-native-video-player';

export default class Videos extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            user_videos: [],

        }

        this._video = [];
        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        var user_videos = this.props.user_videos;
        if(user_videos != null) {
            // for(var i = 0; user_videos.length; i ++) {
            //     if(isUrl(user_videos[i].url)) {
            //         user_videos[i].link = true;
            //     } else {
            //         user_videos[i].link = false;
            //     }
            // }
            this.setState({
                user_videos: user_videos
            })
        }
    }

    // isURL = (str) => {
    //     if(str == null) {
    //         return false;
    //     }
    //     var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    //     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    //     '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    //     '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    //     '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    //     '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    //     return pattern.test(str);
    // }

    render() {
        return (
            <View style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 10}}>
            {
                !this.state.loading && this.state.user_videos != null && this.state.user_videos.length == 0 &&
                <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: Colors.primary}}>{"There is no Videos"}</Text>
                </View>
            }
            {
                this.state.user_videos != null && this.state.user_videos.length > 0 && this.state.user_videos.map((item, index) => 
                <View key = {index} style = {{width: '100%', aspectRatio: 1, marginVertical: 10}}>
                {
                    item.url != null && item.url.substring(0, 4).toLowerCase() == "http" &&
                    <WebView
                        javaScriptEnabled={true}
                        scrollEnabled={false}
                        allowsFullscreenVideo={true}
                        source={{ uri: item.url }}
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
                )
            }
            </View>
        )
    }
}

const styles = StyleSheet.create({

})