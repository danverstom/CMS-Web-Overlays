var last_text_items = []

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

const ScoreBar = {
    data() {
        return {
            current_text: "CTF Match Spotlight",
            text_items: ["CTF Match Spotlight", "Draft Team Tournament"],
            red_name: "Red Team",
            red_score: 0,
            red_logo: "",

            blue_name: "Blue Team",
            blue_score: 0,
            blue_logo: "",
        }
    },
    mounted() {
        setInterval(() => {
            this.cycleTextItems();
        }, 15000)
    },
    delimiters: ['[[', ']]'],
    created: function () {
        this.getScoreBarData();
        setInterval(this.getScoreBarData, 15000);
        this.connectWebSocket(this, "/ws/scorebar")
    },
    methods: {
        getScoreBarData() {
            // Function to GET score bar data from /get_score_bar_data
            var context = this;
            fetch("/get_score_bar_data")
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);
                    context.updateScoreBarData(data);
                })
                .catch(function (error) {
                    console.log(error);
                    if (error instanceof TypeError) {
                        context.current_text = "Network Error";
                        setTimeout(() => {
                            context.cycleTextItems();
                        }, 2000);
                    }
                });
        },
        updateScoreBarData(data) {
            if (!arrayEquals(last_text_items, data.text_items)) {
                this.text_items = data.text_items;
            }
            last_text_items = data.text_items;
            this.red_name = data.red_name;
            this.red_score = data.red_score;
            this.red_logo = data.red_logo;
            this.blue_name = data.blue_name;
            this.blue_score = data.blue_score;
            this.blue_logo = data.blue_logo;
        },
        handleWebSocketMessage(data) {
            if (data.action_type == "connected") {
                this.current_text = "Websocket Connected";
                setTimeout(() => {
                    this.cycleTextItems();
                }, 2000);
            } else if (data.action_type == "update_score_bar_data") {
                this.updateScoreBarData(data.score_bar_data);
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
                context.current_text = "Websocket Disconnected";
                setTimeout(function () {
                    context.connectWebSocket(context, endpoint);
                    context.cycleTextItems();
                }, 1000);
            };
            context.connection.onerror = function (error) {
                console.error('Socket encountered error: ', error.message, 'Closing socket');
                context.connection.close();
            };
        },
        cycleTextItems(){
            var context = this;
            var t1 = anime.timeline();
            t1.add({
                targets: "#main_title",
                opacity: [1, 0],
                translateY: [0, 5],
                duration: 200,
                easing: 'easeInOutSine',
                complete: function () {
                    var new_text = context.text_items.shift();
                    context.text_items.push(new_text);
                    context.current_text = new_text;
                }
            })
            t1.add({
                targets: "#main_title",
                opacity: [0, 1],
                translateY: [-5, 0],
                duration: 200,
                easing: 'easeInOutSine',
            })
        }
    }
}

Vue.createApp(ScoreBar).mount("#score_bar")