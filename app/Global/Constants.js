import { getYears } from '../utils/utils';

export const Constants = {
    KEY_USER_EMAIL: "user_email",
    KEY_USER_PASSWORD: "user_password",
    PROFILE_CHANGED: "profile_changed",
    NOTIFICATION_CHANGED: "profile_changed",

    warnning: 'Warnning!',
    user_email_error: 'Please input correct email address.',
    user_password_length_error: 'Password have to be at least 4 characters',
    user_password_confirm_error: 'Password do not match. Please try again.',

    recruits_send_empty_message: "Please input message to send",

    schedule_title_error: "Please input title",
    schedule_location_error: "Please input location",

    game_title_error: "Please input title",
    game_link_error: "Please input correct link",

    delete_alert_title: "Are your sure to delete",
    delete_alert_message: "You can't recover it",

    

    recruits_rank_array: [
        {rank: 1, label: "Rank 1", used: false},
        {rank: 2, label: "Rank 2", used: false},
        {rank: 3, label: "Rank 3", used: false},
        {rank: 4, label: "Rank 4", used: false},
        {rank: 5, label: "Rank 5", used: false},
        {rank: 6, label: "Rank 6", used: false},
        {rank: 7, label: "Rank 7", used: false},
        {rank: 8, label: "Rank 8", used: false},
        {rank: 9, label: "Rank 9", used: false},
        {rank: 10, label: "Rank 10", used: false}
    ],
    eligibilities: [
        { label: 'NCAA I', value: 'NCAA_I'},
        { label: 'NCAA II', value: 'NCAA_II'},
        { label: 'NCAA III', value: 'NCAA_III'},
        { label: 'NAIA', value: 'NAIA'},
        { label: 'NJCAA I', value: 'NJCAA_I'},
        { label: 'NJCAA II', value: 'NJCAA_II'},
        { label: 'NJCAA III', value: 'NJCAA_III'}
    ],
    positions: [
        {label: 'QB', value: 'QB'},
        {label: 'RB', value: 'RB'},
        {label: 'FB', value: 'FB'},
        {label: 'OL', value: 'OL'},
        {label: 'WR', value: 'WR'},
        {label: 'TE', value: 'TE'},
        {label: 'DL', value: 'DL'},
        {label: 'LB', value: 'LB'},
        {label: 'CB', value: 'CB'},
        {label: 'S',  value: 'S'},
        {label: 'K',  value: 'K'},
        {label: 'P',  value: 'P'},
        {label: 'PR', value: 'PR'},
        {label: 'LS', value: 'LS'}
    ],
    states: [
        {label: 'Alabama', value: 'AL'},
        {label: 'Alaska', value: 'AK'},
        {label: 'Arizona', value: 'AZ'},
        {label: 'Arkansas', value: 'AR'},
        {label: 'California', value: 'CA'},
        {label: 'Colorado', value: 'CO'},
        {label: 'Connecticut', value: 'CT'},
        {label: 'Delaware', value: 'DE'},
        {label: 'Florida', value: 'FL'},
        {label: 'Georgia', value: 'GA'},
        {label: 'Hawaii', value: 'HI'},
        {label: 'Idaho', value: 'ID'},
        {label: 'Illinois', value: 'IL'},
        {label: 'Indiana', value: 'IN'},
        {label: 'Iowa', value: 'IA'},
        {label: 'Kansas', value: 'KS'},
        {label: 'Kentucky', value: 'KY'},
        {label: 'Louisiana', value: 'LA'},
        {label: 'Maine', value: 'ME'},
        {label: 'Maryland', value: 'MD'},
        {label: 'Massachusetts', value: 'MA'},
        {label: 'Michigan', value: 'MI'},
        {label: 'Minnesota', value: 'MN'},
        {label: 'Mississippi', value: 'MS'},
        {label: 'Missouri', value: 'MO'},
        {label: 'Montana', value: 'MT'},
        {label: 'Nebraska', value: 'NE'},
        {label: 'Nevada', value: 'NV'},
        {label: 'New Hampshire', value: 'NH'},
        {label: 'New Jersey', value: 'NJ'},
        {label: 'New Mexico', value: 'NM'},
        {label: 'New York', value: 'NY'},
        {label: 'North Carolina', value: 'NC'},
        {label: 'North Dakota', value: 'ND'},
        {label: 'Ohio', value: 'OH'},
        {label: 'Oklahoma', value: 'OK'},
        {label: 'Oregon', value: 'OR'},
        {label: 'Pennsylvania', value: 'PA'},
        {label: 'Rhode Island', value: 'RI'},
        {label: 'South Carolina', value: 'SC'},
        {label: 'South Dakota', value: 'SD'},
        {label: 'Tennessee', value: 'TN'},
        {label: 'Texas', value: 'TX'},
        {label: 'Utah', value: 'UT'},
        {label: 'Vermont', value: 'VT'},
        {label: 'Virginia', value: 'VA'},
        {label: 'Washington', value: 'WA'},
        {label: 'West Virginia', value: 'WV'},
        {label: 'Wisconsin', value: 'WI'},
        {label: 'Wyoming', value: 'WY'}
    ],
    years: getYears(),
}