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
import { buildQuery } from '../utils/utils';

import {
    InAppPurchase,
    PurchaseError,
    SubscriptionPurchase,
    acknowledgePurchaseAndroid,
    consumePurchaseAndroid,
    finishTransaction,
    finishTransactionIOS,
    purchaseErrorListener,
    purchaseUpdatedListener,
} from 'react-native-iap';
import * as RNIap from 'react-native-iap'

var TAG = "MembershipScreen";

var purchaseUpdateSubscription = null;
var purchaseErrorSubscription = null;

export default class MembershipScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            user_role: Global.USER_ROLE,
            loading: false,
            purchase_membership_type: "", // "one month", "six month", "team access"
            inapppurchase_response: null,
            current_membership_type: "", // "one month", "six month", "team access",
            membership_items: [],

            purchase_processing: false
        }

    }

    async componentDidMount() {
        
        this.getMembership();
        
        var result = null;
        try {
            result = await RNIap.initConnection();
        } catch (error) {
            console.log("init connection error:", error);
            if(Platform.OS == "android") {
                Alert.alert("Warnning!", "Billing is unavailable. This may be a problem with your device, or the Play Store may be down.");
            }
            RNIap.endConnection();
            return
        }

        if(Platform.OS == "ios") {
            await RNIap.clearProductsIOS();
            await RNIap.clearTransactionIOS();
        } else {
            await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
        }

        await IAP.getPurchaseHistory()
          .catch(() => {})
          .then((res) => {
            try {
                if(res != null && res.length > 0) {
                    const receipt = res[res.length - 1].transactionReceipt;
                    if (receipt && receipt.productId) {
                        var purchase_membership_type = "";
                        if(receipt.productId == ) {
                            purchase_membership_type = "one month";
                        } else if(receipt.productId == "") {
                            purchase_membership_type = "six month";
                        } else if(receipt.productId == "") {
                            purchase_membership_type = "team access";
                        }
                        this.setState({
                            purchase_membership_type: purchase_membership_type
                        }, () => this.upgradeMembership(receipt))
                    }
                }
            } catch (error) {
                console.log("getPurchaseHistory error", JSON.stringify(error))
            }
        })
          

        if(result) {
            try {
                const products = await RNIap.getSubscriptions(Global.itemSkus);
                console.log(products)
                
                this.setState({ products });

                purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: InAppPurchase | SubscriptionPurchase) => {
                    const receipt = purchase.transactionReceipt;
                    console.log("------------------------------------------------------------")
                    console.log(JSON.stringify(receipt));
                    console.log("------------------------------------------------------------")
                    if(receipt) {
                        try {
                            if(this.state.purchase_processing) {
                                this.upgradeMembership(receipt);
                                this.setState({
                                    inapppurchase_response: purchase
                                })
                            }
                            if (Platform.OS === 'ios') {
                                
                                const ackResult = await finishTransactionIOS(purchase.transactionId);
                            } else if (Platform.OS === 'android') {
                            //   // If consumable (can be purchased again)
                            //   consumePurchaseAndroid(purchase.purchaseToken);
                            //   // If not consumable
                            //   acknowledgePurchaseAndroid(purchase.purchaseToken);
                                const ackResult = await finishTransaction(pourchase)
                            }
                        } catch (ackErr) {
                            this.setState({
                                loading: false
                            })
                            console.log('ackErr', ackErr);
                            
                        }
                    } else {
                        this.setState({
                            loading: false
                        })
                        console.log("receipt error");
                        this.setState({
                            loading: false,
                            purchase_processing: false
                        });
                    }
                    
                })
              
                purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
                    
                        this.setState({
                            loading: false,
                            purchase_processing: false
                        });
                        if(error != null && error.code == "E_USER_CANCELLED") {
                            
                        } else {
                            Alert.alert("Warnning!", "Your payment did not go through.");
                        }
                    },
                );

            } catch(err) {
                console.log(err); // standardized err.code and err.message available
                this.setState({
                    loading: false
                })
            }
        }
    }

    componentWillUnmount() {
        console.log("-----------------------------  membership screen unmounted")
        try {
            RNIap.endConnection();
            if (purchaseUpdateSubscription) {
                purchaseUpdateSubscription.remove();
                purchaseUpdateSubscription = null;
            }
            if (purchaseErrorSubscription) {
                purchaseErrorSubscription.remove();
                purchaseErrorSubscription = null;
            }
            
        }catch(error) {
            console.log("membership screen unmount error: ", error)
        }
    }

    getMembership = async() => {
        try {
            this.setState({
                loading: true,
            });
            
            var uri = Global.BASE_URL + "/api/memberships";
                                                
            console.log(TAG + " callGetMembershipAPI uri " + uri);

            WebService.callServiceGet(uri, this.handleGetMembershipAPI);
        } catch (error) {
            console.log(error)
            this.setState({
                loading: false,
            });
        }
    }

    handleGetMembershipAPI = async(response, isError) => {
        console.log(TAG + " callGetMembershipAPI Response " + JSON.stringify(response));
        console.log(TAG + " callGetMembershipAPI isError " + isError);
        try {
            if(!isError) {
                if(response.status == "success") {
                    this.setState({
                        membership_items: response.memberships
                    })
                    if(Global.MEMBERSHIPS != null) {
                        console.log("Global.MEMBERSHIPS", Global.MEMBERSHIPS);
                        for(var i = 0; i < response.memberships.length; i ++) {
                            if(Global.MEMBERSHIPS == response.memberships[i].id) {
                                if(response.memberships[i].type == "MEMBERSHIP_1") {
                                    this.setState({
                                        current_membership_type: "one month"
                                    })
                                } else if(response.memberships[i].type == "MEMBERSHIP_2") {
                                    this.setState({
                                        current_membership_type: "six month"
                                    })
                                } else if(response.memberships[i].type == "TEAM") {
                                    this.setState({
                                        current_membership_type: "team access"
                                    })
                                }
                            }
                        }
                    }
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

    purchaseMembership = async(type) => {
        this.setState({
            loading: true,
            purchase_membership_type: type,
            purchase_processing: true
        }, () => {
            if(type == "one month") {
                if(Platform.OS == "ios") {
                    RNIap.requestSubscription('');
                } else if(Platform.OS == "android") {
                    RNIap.requestSubscription('');
                }
            } else if(type == "six month") {
                if(Platform.OS == "ios") {
                    RNIap.requestSubscription('');
                } else if(Platform.OS == "android") {
                    RNIap.requestSubscription('');
                }
            } else  if(type == "team access") {
                if(Platform.OS == "ios") {
                    RNIap.requestSubscription('');
                } else if(Platform.OS == "android") {
                    RNIap.requestSubscription('');
                }
            }
        })
        
    }

    upgradeMembership = async(purchase_receipt) => {
        if(purchase_receipt == null) {
            this.setState({
                loading: false
            });
            return;
        }

        try {

            let uri = Global.BASE_URL +  "/api/purchase_subscription";
            var membership_id = 0;
            var subscription_id = "";
            for(var i = 0; i < this.state.membership_items.length; i ++) {
                if(this.state.purchase_membership_type == "one month") {
                    if(this.state.membership_items[i].type == "MEMBERSHIP_1") {
                        membership_id = this.state.membership_items[i].id;
                        break;
                    }
                } else if(this.state.purchase_membership_type == "six month") {
                    if(this.state.membership_items[i].type == "MEMBERSHIP_2") {
                        membership_id = this.state.membership_items[i].id;
                        break;
                    }
                } else if(this.state.purchase_membership_type == "team access") {
                    if(this.state.membership_items[i].type == "TEAM") {
                        membership_id = this.state.membership_items[i].id;
                        break;
                    }
                }
            }

            if(membership_id == 0) {
                this.setState({
                    loading: false
                });
                return;
            }

            var store_type = "";
            if(Platform.OS == "ios") {
                store_type = "APP";
            } else if(Platform.OS == "android") {
                store_type = "GOOGLE";
            }
            let params = JSON.stringify({
                membership: membership_id,
                receipt: purchase_receipt,
                store_type: store_type,
                package_name: ""
            })          
            console.log(TAG + " callActivatePlanAPI uri " + uri);
            console.log(TAG + " callActivatePlanAPI params " + JSON.stringify(params));

            WebService.callServicePost(uri, params, this.handleActivatePlan);
        } catch (error) {
            console.log(TAG + " callActivatePlanAPI error " + error);
            this.setState({
                loading: false
            });
            Alert.alert("Warnning!", "Network error. Please try again.");
        }
    }

    handleActivatePlan = async(response, isError) => {
        console.log(TAG + " callActivatePlanAPI Response " + JSON.stringify(response));
        console.log(TAG + " callActivatePlanAPI isError " + isError);

        if (!isError) {
            var result = response;
            if (result != undefined && result != null) {
                if(result.status == "success") {
                    if(this.state.inapppurchase_response != null) {
                        // const ackResult = await finishTransactionIOS(this.state.inapppurchase_response.transactionId);
                        this.setState({
                            inapppurchase_response: null,
                        })
                        Global.MEMBERSHIPS = result.membership;
                        for(var i = 0; i < this.state.membership_items.length; i ++) {
                            if(this.state.membership_items[i].id == result.membership) {
                                if(this.state.membership_items[i].type == "MEMBERSHIP_1") {
                                    this.setState({
                                        current_membership_type: "one month"
                                    })
                                } else if(this.state.membership_items[i].type == "MEMBERSHIP_2") {
                                    this.setState({
                                        current_membership_type: "six month"
                                    })
                                } else if(this.state.membership_items[i].type == "TEAM") {
                                    this.setState({
                                        current_membership_type: "team access"
                                    })
                                }
                                break;
                            }
                        }
                    }
                } else {
                    if(this.state.purchase_processing) {
                        Alert.alert("Warnning!", result.message);
                    }
                }
            }
        } else {
            Alert.alert(Constants.warnning, "Network error. Please try again");
            
        }
        this.setState({
            loading: false,
            purchase_processing: false
        });
    }

    restore_purchase = async() => {
        this.setState({
            loading: true
        });
        try {
            const result = await RNIap.initConnection();
            const purchases = await RNIap.getAvailablePurchases();
            console.log(purchases)
            if(purchases && purchases.length > 0) {
                var restore_exist = false
                for(var i = 0; i < purchases.length; i ++) {
                    if(this.state.current_membership_type == "one month" && purchases[i].productId == Platform.OS == "ios" ? "" : "") {
                        restore_exist = true;
                        break;
                    }
                    if(this.state.member_plan == "six month" && purchases[i].productId == Platform.OS == "ios" ? "" : "") {
                        restore_exist = true;
                        break;
                    }
                    if(this.state.member_plan == "team access" && purchases[i].productId == Platform.OS == "ios" ? "" : "") {
                        restore_exist = true;
                        break;
                    }
                }
                if(restore_exist) {
                    // call membership paid api
                    Alert.alert("Restore Membership", "Your membership payment has been restored.");
                } else {
                    Alert.alert(Constants.warnning, "You have no any purchased. Please get a membership plan.");
                }
            } else {
                Alert.alert("You have no any purchased. Please get a membership plan.", "");
            }
        } catch (err) {
            console.log("---------------", err)
            Alert.alert(Constants.warnning, "There is an error in restore purchase.");
        }
        this.setState({
            loading: false
        });
    }
    
    render() {
        return (
            <Container style = {{flex: 1, width: '100%', height: '100%'}} navigation = {this.props.navigation}>
            {
                this.state.loading &&
                <ProgressIndicator/>
            }
                <ScrollView style = {{width: '100%'}}>
                    <View style = {{width: '100%', height: 350, backgroundColor: Colors.primary, opacity: 0.9, position: 'absolute', top: 0, left: 0}}></View>
                {
                    Platform.OS == "ios" &&
                    <TouchableOpacity style = {{paddingHorizontal: 15, paddingVertical: 10, backgroundColor: Colors.secondary, borderRadius: 5, position: 'absolute', top: 15, right: 15, zIndex: 10, elevation: 1}} onPress = {() => this.restore_purchase()}>
                        <Text style = {{fontSize: 16, color: Colors.white,}}>{"Restore Purchase"}</Text>
                    </TouchableOpacity>
                }
                    <View style = {{width: '100%', alignItems: 'center'}}>
                        <Text style = {{fontSize: 48, color: Colors.white, marginTop: 70, textAlign: 'center'}}>{"Membership\nAccess"}</Text>
                        <View style = {[styles.component_view, {marginTop: 70}]}>
                            <View style = {styles.header_view}>
                                <Text style = {styles.header_text}>{"Membership Access"}</Text>
                            </View>
                            <View style = {styles.component_main_view}>
                                <View style = {styles.price_view}>
                                    <Text style = {styles.unit_text}>{"$"}</Text>
                                    <Text style = {styles.price_text}>{"14.99"}</Text>
                                    <View style = {{justifyContent: 'flex-end'}}>
                                        <Text style = {styles.unit_text}>{"/ 1 month"}</Text>
                                    </View>
                                </View>
                                <Text style = {styles.payment_description_text}>{"Membership fee for 1 month. Members can be Recruit Player and so coaches can direct these Members. Please visit "}
                                    <Text style = {{color: '#0000ff'}} onPress={() => {
                                            console.log(TAG, "Global.TERMS_AND_CONDITIONS_URL " + Global.TERMS_AND_CONDITIONS_URL)
                                            Linking.openURL("https://postgradrecruits.com/privacy-policy.html")
                                        }}>{"Privacy and Policy"}
                                    </Text>{" and "}
                                    <Text style = {{color: '#0000ff'}} onPress={() => {
                                            console.log(TAG, "Global.TERMS_AND_CONDITIONS_URL " + Global.TERMS_AND_CONDITIONS_URL)
                                            Linking.openURL("https://postgradrecruits.com/terms-of-use.html")
                                        }}>{"Terms of Use"}
                                    </Text>{" for more information."}</Text>
                            {
                                this.state.current_membership_type == "one month" &&
                                <Text style = {styles.current_plan_text}>{"Current Membership"}</Text>
                            }
                            {
                                this.state.current_membership_type != "one month" &&
                                <TouchableOpacity style = {styles.button} onPress = {() => this.purchaseMembership("one month")}>
                                    <Text style = {styles.button_text}>{"GET ACCESS"}</Text>
                                </TouchableOpacity>
                            }
                            </View>
                        </View>
                        <View style = {[styles.component_view,]}>
                            <View style = {styles.header_view}>
                                <Text style = {styles.header_text}>{"Membership Access"}</Text>
                            </View>
                            <View style = {styles.component_main_view}>
                                <View style = {styles.price_view}>
                                    <Text style = {styles.unit_text}>{"$"}</Text>
                                    <Text style = {styles.price_text}>{"44.99"}</Text>
                                    <View style = {{justifyContent: 'flex-end'}}>
                                        <Text style = {styles.unit_text}>{"/ 6 month"}</Text>
                                    </View>
                                </View>
                                <Text style = {styles.payment_description_text}>{"Membership fee for 6 months. Members can be Recruit Player and so coaches can direct these Recruit Players. Please visit "}
                                    <Text style = {{color: '#0000ff'}} onPress={() => {
                                            console.log(TAG, "Global.TERMS_AND_CONDITIONS_URL " + Global.TERMS_AND_CONDITIONS_URL)
                                            Linking.openURL("https://postgradrecruits.com/privacy-policy.html")
                                        }}>{"Privacy and Policy"}
                                    </Text>{" and "}
                                    <Text style = {{color: '#0000ff'}} onPress={() => {
                                            console.log(TAG, "Global.TERMS_AND_CONDITIONS_URL " + Global.TERMS_AND_CONDITIONS_URL)
                                            Linking.openURL("https://postgradrecruits.com/terms-of-use.html")
                                        }}>{"Terms of Use"}
                                    </Text>{" for more information."}</Text>
                            {
                                this.state.current_membership_type == "six month" &&
                                <Text style = {styles.current_plan_text}>{"Current Membership"}</Text>
                            }
                            {
                                this.state.current_membership_type != "six month" &&
                                <TouchableOpacity style = {styles.button} onPress = {() => this.purchaseMembership("six month")}>
                                    <Text style = {styles.button_text}>{"GET ACCESS"}</Text>
                                </TouchableOpacity>
                            }
                            </View>
                        </View>
                        <View style = {[styles.component_view,]}>
                            <View style = {styles.header_view}>
                                <Text style = {styles.header_text}>{"Team Access"}</Text>
                            </View>
                            <View style = {styles.component_main_view}>
                                <View style = {styles.price_view}>
                                    <Text style = {styles.unit_text}>{"$"}</Text>
                                    <Text style = {styles.price_text}>{"14.99"}</Text>
                                    <View style = {{justifyContent: 'flex-end'}}>
                                        <Text style = {styles.unit_text}>{"/ 1 month"}</Text>
                                    </View>
                                </View>
                                <Text style = {styles.payment_description_text}>{"Team Access Membership fee for 1 month. A coach can sign his team of players up as members. Please visit "}
                                    <Text style = {{color: '#0000ff'}} onPress={() => {
                                            console.log(TAG, "Global.TERMS_AND_CONDITIONS_URL " + Global.TERMS_AND_CONDITIONS_URL)
                                            Linking.openURL("https://postgradrecruits.com/privacy-policy.html")
                                        }}>{"Privacy and Policy"}
                                    </Text>{" and "}
                                    <Text style = {{color: '#0000ff'}} onPress={() => {
                                            console.log(TAG, "Global.TERMS_AND_CONDITIONS_URL " + Global.TERMS_AND_CONDITIONS_URL)
                                            Linking.openURL("https://postgradrecruits.com/terms-of-use.html")
                                        }}>{"Terms of Use"}
                                    </Text>{" for more information."}</Text>
                            {
                                this.state.current_membership_type == "team access" &&
                                <Text style = {styles.current_plan_text}>{"Current Membership"}</Text>
                            }
                            {
                                this.state.current_membership_type != "team access" &&
                                <TouchableOpacity style = {styles.button} onPress = {() => this.purchaseMembership("team access")}>
                                    <Text style = {styles.button_text}>{"GET ACCESS"}</Text>
                                </TouchableOpacity>
                            }
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    component_view: {
        width: '80%',
        borderRadius: 10,
        backgroundColor: Colors.black,
        overflow: 'hidden',
        marginBottom: 30
    },
    header_view: {
        width: '100%', 
        paddingVertical: 15, 
        paddingHorizontal: 20, 
        backgroundColor: Colors.black
    },
    header_text: {
        fontSize: 16, 
        color: Colors.white
    },
    component_main_view: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    price_view: {
        width: '100%',
        flexDirection: 'row', 
        borderBottomWidth: Colors.grey, 
        borderBottomWidth: 0.5, 
        paddingVertical: 30,
        justifyContent: 'center'
    },
    unit_text: {
        fontSize: 20, 
        color: Colors.grey
    },
    price_text: {
        fontSize: 48, 
        color: Colors.grey, 
        marginHorizontal: 5
    },
    button: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        backgroundColor: Colors.secondary,
        marginTop: 30,
        marginBottom: 20
    },
    button_text: {
        fontSize: 16, 
        color: Colors.primary,
    },
    current_plan_text: {
        marginTop: 20,
        marginBottom: 20,
        fontSize: 16, 
        color: Colors.primary,
    },
    payment_description_text: {
        marginTop: 20,
        fontSize: 14, 
        color: Colors.primary,
    }
})