const IntervalPage = {
    delimiters: ['[[', ']]'],
    data() {
        return {
            title_text: "CTF Match Spotlight",
            small_title_text: "Be Right Back",
            timer_display: "00:00",
            timer_active: false,

            red_name: "The Roxerces",
            red_logo: "/static/assets/team_logos/roxerces.png",

            blue_name: "Les Berets",
            blue_logo: "/static/assets/team_logos/les_berets.png",

            display_teams: false,
            timer_interval: false
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
            var duration = durationMinutes * 60;
            var context = this;
            var timer = duration, minutes, seconds;
            context.timer_interval = setInterval(function () {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                context.timer_display = minutes + ":" + seconds;
                context.timer_active = true;

                if (--timer < 0) {
                    clearInterval(context.timer_interval);
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
            console.log(data);
            if (data.action_type == "connected") {
                console.log("Websocket Connected");
                if (data.ws_type == "starting_soon") {
                    this.display_teams = data.display_teams;
                    console.log(this.display_teams);
                }
            } else if (data.action_type == "toggle_teams_display") {
                this.display_teams = data.display_teams;
            } else if (data.action_type == "update_score_bar_data") {
                this.red_name = data.score_bar_data.red_name
                this.red_logo = data.score_bar_data.red_logo;
                this.blue_name = data.score_bar_data.blue_name;
                this.blue_logo = data.score_bar_data.blue_logo;
            } else if (data.action_type == "start_timer") {
                clearInterval(this.timer_interval);
                this.startTimer(data.duration);
            } else if (data.action_type == "set_interval_text") {
                this.small_title_text = data.interval_text;
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

var app = Vue.createApp(IntervalPage).mount("#interval")