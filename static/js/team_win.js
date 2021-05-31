const TeamWin = {
    data() {
        return {
            team_win_data: {
                team_logos: [],
                primary_text: "Offline",
                secondary_text: "Offline"
            }
        }
    },
    methods: {
        handleWebSocketMessage(data) {
            if (data.action_type == "connected") {
                if (data.ws_type == "team_win") {
                    console.log("Team Win Websocket Connected");
                    this.team_win_data = data.team_win_data;
                }
            } else if (data.action_type == "update_team_win_data"){
                this.team_win_data = data.team_win_data;
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
        this.connectWebSocket(this, "/ws/team_win");
    },
    delimiters: ["[[", "]]"]
}

Vue.createApp(TeamWin).mount("#team_win");