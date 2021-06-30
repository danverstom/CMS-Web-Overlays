const Draft = {
    data() {
        return {
            teams: {"mikye": ["memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1"] },
            current_leader: "mikye",
            all_usernames: [],
            upper_usernames: [],
            lower_usernames: [],
            team_view: false,
            pickee: "Notch"
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
        showLeaderData(data){
            var t1 = anime.timeline();
            var context = this;   
            context.team_view = false;
            context.current_leader = data.roster_data.current_leader;
            context.pickee = "";

        },
        showRosterData(data){
            var t1 = anime.timeline();
            var context = this;
            context.team_view = true;
            t1.add({
                targets: '.card',
                opacity: [1, 0],
                rotateZ: [0, 10],
                translateY: [0, 200],
                delay: anime.stagger(50),
                easing: "easeInBack",
                duration: 500,
                complete: function () {
                    context.all_usernames = data.roster_data.teams[data.roster_data.current_leader];
                    context.current_leader = data.roster_data.current_leader
                    context.splitUsernames();
                }
            })
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
        setRosterData(data){
            var context = this;   
            context.teams = data.roster_data.teams;
            console.log("set roster data");
        },
        toggleTeamView(){
            var context = this;
            if(context.team_view == false){
                context.team_view = true;  
            }else{
                context.team_view = false;
            }
        },
        addPlayerData(data){
            var context = this;
            context.teams = data.roster_data.teams;
            if(context.team_view == true || context.current_leader != data.roster_data.current_leader){
                //animation to hide eeverything on screen
            }
            context.current_leader = data.roster_data.current_leader;
            context.pickee = data.roster_data.pickee;
            context.team_view = false;
            setTimeout(function () {
                context.team_view = true;
                context.showRosterData(data);
            }, 5000);
            //todo
        },
        handleWebSocketMessage(data) {
            if (data.action_type == "connected") {
                if (data.ws_type == "draft") {
                    console.log("Draft Websocket Connected");
                    //this.showRosterData(data);
                }
            } else if (data.action_type == "addPlayerData") {
                this.addPlayerData(data);
            } else if (data.action_type == "showLeaderData") {
                this.showLeaderData(data);
            } else if (data.action_type == "showRosterData") {
                this.showRosterData(data);
            } else if (data.action_type == "setRosterData") {
                this.setRosterData(data);
            }
        },
        connectWebSocket(context, endpoint) {
            var ws_protocol = "ws://";
            if (location.protocol == "https:") {
                console.log("HTTPS detected, using secure sockets");
                ws_protocol = "wss://"
            }
            context.connection = new WebSocket(ws_protocol + document.domain + ':' + location.port + endpoint);
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
        this.connectWebSocket(this, "/ws/draft");
    },
    delimiters: ['[[', ']]']
}

Vue.createApp(Draft).mount("#draft");