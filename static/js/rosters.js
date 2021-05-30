const Rosters = {
    data() {
        return {
            counter: 0,
            all_usernames: [],
            upper_usernames: [],
            lower_usernames: [],
            team_logo: "",
            team_name: "Red Team (Offline)",

            current_roster: "red",

            red_roster: {
                usernames: [
                    "Notch", "Notch", "Notch", "Notch", "Notch", "Notch",
                    "Notch", "Notch", "Notch", "Notch", "Notch", "Notch"
                ]
            },

            blue_roster: {
                usernames: [
                    "Notch", "Notch", "Notch", "Notch", "Notch", "Notch",
                    "Notch", "Notch", "Notch", "Notch", "Notch", "Notch"
                ]
            },

            red_name: "Red Team (Offline)",
            red_logo: "",
            blue_name: "Blue Team (Offline)",
            blue_logo: ""
        }
    },
    methods: {
        splitUsernames() {
            if (this.all_usernames) {
                var half = Math.ceil(this.all_usernames.length / 2);
                this.upper_usernames = this.all_usernames.slice(0, half);
                this.lower_usernames = this.all_usernames.slice(-half);
            } else {
                console.error("No usernames in list")
            }

        },
        cycleRosters(new_roster) {
            var t1 = anime.timeline();
            var context = this;
            var new_roster = new_roster;
            t1.add({
                targets: '.card',
                opacity: [1, 0],
                rotateZ: [0, 10],
                translateY: [0, 200],
                delay: anime.stagger(50),
                easing: "easeInBack",
                duration: 500,
                complete: function () {
                    context.all_usernames = new_roster.usernames;
                    context.team_logo = new_roster.logo;
                    context.team_name = new_roster.name;
                    context.splitUsernames();
                    anime({
                        targets: '#rosters-team-logo',
                        opacity: [0, 1],
                        duration: 500,
                        easing: "easeOutBack",
                    })
                }
            })
            t1.add({
                targets: '#rosters-team-logo',
                opacity: [1, 0],
                duration: 500,
                easing: "easeInBack",
            }, 0)
            t1.add({
                targets: '.card',
                opacity: [0, 1],
                rotateZ: [-10, 0],
                translateY: [-200, 0],
                delay: anime.stagger(50),
                easing: "easeOutBack",
                duration: 500
            })
        },
        updateRosterData(data) {
            this.red_roster = data.roster_data.red_roster;
            this.red_roster.name = this.red_name;
            this.red_roster.logo = this.red_logo;
            this.blue_roster = data.roster_data.blue_roster;
            this.blue_roster.name = this.blue_name;
            this.blue_roster.logo = this.blue_logo;
            if (data.roster_data.current_team == "red") {
                var current_roster = this.red_roster;
            } else if (data.roster_data.current_team == "blue") {
                var current_roster = this.blue_roster;
            }
            if (this.current_team != data.roster_data.current_team) {
                this.cycleRosters(current_roster)
            } else {
                this.all_usernames = current_roster.usernames;
                this.splitUsernames();
            }
            this.current_team = data.roster_data.current_team;
        },
        handleWebSocketMessage(data) {
            if (data.action_type == "connected") {
                if (data.ws_type == "rosters") {
                    console.log("Rosters Websocket Connected");
                    this.updateRosterData(data);
                } else if (data.ws_type == "scorebar") {
                    console.log("Score Bar Websocket Connected");
                    this.red_name = data.score_bar_data.red_name;
                    this.red_logo = data.score_bar_data.red_logo;
                    this.blue_name = data.score_bar_data.blue_name;
                    this.blue_logo = data.score_bar_data.blue_logo;
                }
            } else if (data.action_type == "update_roster_data") {
                this.updateRosterData(data);
            } else if (data.action_type == "update_score_bar_data") {
                this.red_name = data.score_bar_data.red_name;
                this.red_logo = data.score_bar_data.red_logo;
                this.blue_name = data.score_bar_data.blue_name;
                this.blue_logo = data.score_bar_data.blue_logo;
                if (this.current_team == "red") {
                    this.team_name = this.red_name;
                    this.team_logo = this.red_logo;
                } else if (this.current_team == "blue") {
                    this.team_name = this.blue_name;
                    this.team_logo = this.blue_logo;
                }
            }
        },
        connectWebSocket(context, endpoint) {
            var ws_protocol = "ws://";
            if (location.protocol == "https:") {
                console.log("HTTPS detected, using secure sockets");
                ws_protocol = "wss://"
            }
            context.connection = new WebSocket(ws_protocol + document.domain + ':' + location.port + endpoint)
            context.connection.onmessage = function (event) {
                var data = JSON.parse(event.data);
                console.log(data);
                context.handleWebSocketMessage(data);
            };
            context.connection.onclose = function (event) {
                console.log('Socket is closed. Reconnect will be attempted in 1 second.');
                setTimeout(function () {
                    context.connectWebSocket(context, endpoint);
                }, 1000);
            };
            context.connection.onerror = function (error) {
                console.error('Socket encountered error: ', error.message, 'Closing socket');
                context.connection.close();
            };
        },
    },
    created: function () {
        this.splitUsernames();
        this.connectWebSocket(this, "/ws/scorebar");
        this.connectWebSocket(this, "/ws/rosters");
        
    },
    delimiters: ['[[', ']]']
}

Vue.createApp(Rosters).mount("#rosters");