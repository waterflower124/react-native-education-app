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
    Modal,
    ActivityIndicator
 } from "react-native";

import { Colors } from '../../utils/Colors';
import { stylesGlobal } from '../../Global/stylesGlobal';
import ProgressIndicator from "../../components/ProgressIndicator";
import * as Global from "../../Global/Global";
import WebService from "../../utils/WebService";
import { Constants } from "../../Global/Constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import Gallery from '../../components/react-native-image-gallery/Gallery';
import {Pagination} from "../../components/react-native-image-gallery/Pagination"

export default class Photos extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            user_photos: [],
            visibleModal: false,
            initial_index: 0,
            imageLoading: true
        }

        this.onEndReachedCalledDuringMomentum = true;
    }

    async UNSAFE_componentWillMount() {
        console.log("asdfasdfasdfasdf")
        var user_photos = this.props.user_photos;
        if(user_photos != null) {
            for(var i = 0; i < user_photos.length; i ++) {
                user_photos[i].source = {uri: Global.BASE_URL + user_photos[i].url};
                // await Image.getSize(Global.BASE_URL + user_photos[i].url, (width, height) => {
                //     console.log(width + "   " + i + "      " + height)
                //     // console.log(JSON.stringify(user_photos[i]))
                //     // user_photos[i].width = 1;
                //     // user_photos[i].height = 1;
                //     // user_photos[i].ratio = 1;
                // }, (error) => {
                //     console.error(`Couldn't get the image size: ${error.message}`);
                // });
            }
            
            this.setState({
                user_photos: user_photos
            })
            console.log(JSON.stringify(user_photos))
        }
    }

    goTo = index => {
        this.setState({ 
            initial_index: index 
        });
    };

    render() {
        return (
            <View style = {{width: '100%', paddingHorizontal: 15, paddingVertical: 10}}>
            {
                !this.state.loading && this.state.user_photos != null && this.state.user_photos.length == 0 &&
                <View style = {{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: Colors.primary}}>{"There is no Photos"}</Text>
                </View>
            }
            {
                this.state.user_photos != null && this.state.user_photos.length > 0 && this.state.user_photos.map((item, index) => 
                <TouchableOpacity key = {index} style = {{width: '100%', aspectRatio: 1, marginVertical: 10, alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.setState({initial_index: index, visibleModal: true})}>
                    <FastImage style = {{width: '100%', height: '100%'}} source = {{uri: Global.BASE_URL + item.url}}
                        onLoadStart={() => {
                            this.setState({
                                imageLoading: true
                            })
                        }}
                        
                        onLoad={(e) => {
                            this.setState({
                                imageLoading: false
                            })
                        }}
                        onError={() => {
                            this.setState({
                                imageLoading: true
                            })
                        }}
                    />
                {
                    this.state.imageLoading &&
                    <ActivityIndicator color = {Colors.grey} size="large" />
                }
                </TouchableOpacity>
                )
            }
                <Modal style = {{width: '100%', height: '100%', backgroundColor: Colors.white}} visible = {this.state.visibleModal}>
                    <TouchableOpacity style = {{position: 'absolute', padding: 10, top: 25, left: 25, zIndex: 10, elevation: 10}} onPress = {() => this.setState({visibleModal: false})}>
                        <Image style = {{width: 20, height: 20, tintColor: Colors.primary}} resizeMode = {'contain'} source={require('../../assets/images/close.png')}/>
                    </TouchableOpacity>
                    <View style = {{flex: 1}}>
                        <Gallery
                            images={this.state.user_photos}
                            initialPage = {this.state.initial_index}
                            onPageScroll = {(event) => this.setState({initial_index: event.position})}
                        />
                        <Pagination
                            index={this.state.initial_index}
                            data={this.state.user_photos}
                            initialPaginationSize={this.state.user_photos.length || 10}
                            goTo={this.goTo}
                        />
                    </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({

})