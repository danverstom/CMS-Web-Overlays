const Rosters = {
    data() {
        return {
            all_usernames: [],
            left_usernames: [],
            right_usernames: [],
            current_team: "Notch",

            draft_data: {},
            latest_player: ""
        }
    },
    methods: {
        splitUsernames() {
            if (this.all_usernames.length) {
                console.log(this.all_usernames)
                if (this.all_usernames.length > 1){
                    var half = Math.ceil(this.all_usernames.length / 2);
                    this.left_usernames = this.all_usernames.slice(0, half);
                    this.right_usernames = this.all_usernames.slice(-(this.all_usernames.length - half));
                } else if (this.all_usernames.length == 1) {
                    this.left_usernames = [this.all_usernames[0]]
                    this.right_usernames = []
                }
            } else {
                console.log("No usernames in list")
                this.left_usernames = []
                this.right_usernames = []
            }

        },
        draftNextPlayer() {
            console.log("drafting next player...");
            var t1 = anime.timeline();
            var next_team = this.draft_data["teams"][this.draft_data["current_team"]]
            var context = this;
            anime({
                targets: "#draft-leader",
                opacity: [1, 0],
                duration: 500,
                translateX: [0, -500],
                easing: "easeInOutBack"
            })
            context.all_usernames = []
            context.splitUsernames();
            setTimeout(() => {
                context.all_usernames = next_team
                context.current_team = context.draft_data["current_team"]
                context.splitUsernames();
                anime({
                    targets: "#draft-leader",
                    opacity: [0, 1],
                    translateX: [-500, 0],
                    duration: 500,
                    easing: "easeInOutBack"
                })
                
            }, 1000);
            
        },
        leave(el, done) {
            anime({
                targets: el,
                opacity: [1, 0],
                duration: 500,
                translateY: [0, -300],
                complete: done,
                easing: "easeInOutBack"
            })
        },
        enter(el, done) {

            anime({
                targets: el,
                opacity: [0, 1],
                translateY: [300, 0],
                duration: 500,
                complete: done,
                easing: "easeInOutBack"
            })
        },
        handleWebSocketMessage(data) {
            if (data.action_type == "connected") {
                if (data.ws_type == "draft") {
                    console.log("Draft Websocket Connected");
                    console.log(data.draft_data)
                    this.draft_data = data.draft_data
                    this.latest_player = this.draft_data.latest_pick.player
                    this.draftNextPlayer();
                }
            } else if (data.action_type == "update_draft_data") {
                this.draft_data = data.draft_data
                this.latest_player = this.draft_data.latest_pick.player
                this.draftNextPlayer();
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
        this.connectWebSocket(this, "/ws/draft");
        
        /*
        setInterval(() => {
            this.draftNextPlayer()
        }, 4000);
        */

    },
    delimiters: ['[[', ']]']
}

Vue.createApp(Rosters).mount("#draft");