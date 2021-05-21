const StartingSoon = {
    delimiters: ['[[', ']]'],
    data() {
        return {
            title_text: "CTF Match Spotlight",
            small_title_text: "Starting Soon",
            timer_display: "00:00",
            timer_active: false,

            red_name: "The Roxerces",
            red_logo: "/static/assets/team_logos/roxerces.png",

            blue_name: "Les Berets",
            blue_logo: "/static/assets/team_logos/les_berets.png",

            display_teams: false,
        }
    },
    created: function () {
        this.getScoreBarData();
        setInterval(this.getScoreBarData, 15000);
        this.connectWebSocket(this, "/ws/starting_soon");
        this.connectWebSocket(this, "/ws/scorebar");
    },
    methods: {
        startTimer(durationMinutes) {
            this.timer_active = true;
            var duration = durationMinutes * 60;
            context = this;
            var timer = duration, minutes, seconds;
            var interval = setInterval(function () {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                context.timer_display = minutes + ":" + seconds;

                if (--timer < 0) {
                    clearInterval(interval);
                    console.log("worked")
                    //context.timer_display = "Please Wait";
                    setTimeout(() => {
                        context.timer_active = false;
                    }, 5000)
                }
            }, 1000);
        },
        getScoreBarData() {
            // Function to GET score bar data from /get_score_bar_data
            var context = this;
            fetch("/get_score_bar_data")
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);
                    context.red_name = data.red_name
                    context.red_logo = data.red_logo;
                    context.blue_name = data.blue_name;
                    context.blue_logo = data.blue_logo;
                })
                .catch(function (error) {
                    console.log(error);
                    if (error instanceof TypeError) {
                        console.log("Network Error")
                    }
                });
        },
        handleWebSocketMessage(data) {
            if (data.action_type == "connected") {
                console.log("Websocket Connected")
            } else if (data.action_type == "toggle_teams_display") {
                this.display_teams = !this.display_teams;
            } else if (data.action_type == "update_score_bar_data") {
                this.red_name = data.score_bar_data.red_name
                this.red_logo = data.score_bar_data.red_logo;
                this.blue_name = data.score_bar_data.blue_name;
                this.blue_logo = data.score_bar_data.blue_logo;
            }
        },
        connectWebSocket(context, endpoint) {
            var ws_protocol = "ws://";
            if (location.protocol == "https:") {
                console.log("HTTPS detected, using secure sockets");
                ws_protocol = "wss://"
            }
            context.connection = new WebSocket(ws_protocol + document.domain + ':' + location.port + endpoint); context.connection.onmessage = function (event) {
                var data = JSON.parse(event.data);
                console.log(data);
                context.handleWebSocketMessage(data);
            };
            context.connection.onclose = function (event) {
                console.log('Socket is closed. Reconnect will be attempted in 1 second.');
                var old_text = context.small_title_text;
                context.small_title_text = "Websocket Disconnected";
                setTimeout(function () {
                    context.small_title_text = old_text;
                    context.connectWebSocket(context, endpoint);
                }, 1000);
            };
            context.connection.onerror = function (error) {
                console.error('Socket encountered error: ', error.message, 'Closing socket');
                context.connection.close();
            };
        },
        enter(el, done) {
            el.classList.remove("hidden");
            anime({
                targets: el,
                translateX: [100, 0],
                opacity: [0, 1],
                easing: 'easeOutBack',
                duration: 500,
                complete: done
            })
        },
        leave(el, done) {
            anime({
                targets: el,
                translateX: [0, 100],
                opacity: [1, 0],
                easing: 'easeOutBack',
                duration: 500,
                complete: function () {
                    el.classList.add("hidden");
                    done();
                }
            })
        }
    },
}

var app = Vue.createApp(StartingSoon).mount("#starting_soon")