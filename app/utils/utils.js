
import * as Global from "../Global/Global";

export const validateEmail = (email) => {
    if(email === null || !email) return false;

    if(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) return true;
    return false;
}

export const localeDateTimeString = (dateStr) => {
    const date = new Date(dateStr);
    if(date === 'Invalid Date') return dateStr;
    return date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) + ' ' + date.toLocaleTimeString('en-US');
}

export const buildQuery = (params) => {
    if(typeof params !== 'object') return '';

    let query = '';
    Object.keys(params).forEach(key => {
        if(query) query += '&';
        else query += '?';

        // if(params[key]) query += `${key}=${params[key]}`;
        query += `${key}=${params[key]}`;
    });

    return query;
}

export const shortName = (name) => {
    if(!name || typeof name !== 'string') return '';

    let _name = '';
    const nameList = name.split(' ');

    nameList.forEach(str => {
        _name += str.slice(0, 1).toUpperCase();
    });
    
    return _name;
}

export const getYears = () => {
    
    let current = new Date().getFullYear();
    let years = [];

    while(current > 1970){
        current --;
        years.push({label: String(current + 1), value: String(current + 1)});
    }

    return years;
}

export const isURL = (string) => {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
}

export const validateIsEmail = (email) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

export const callGetRankingList = async() => {

    var header = {
        'Authorization': 'Bearer ' + Global.API_TOKEN,
    }

    let uri = Global.BASE_URL + "/api/ranking_list";
    console.log(" callGetRankingListAPI uri " + uri);
    const response  = await fetch(uri, {
        method: "GET",
        headers: header
    })
    
    if(response.status == 200) {
        const jRes = await response.json()
        console.log(" callGetRankingListAPI response:  " + JSON.stringify(jRes));
        
        return jRes
    } else {
        return {"status": false, "msg": "network_error"};
    }
}