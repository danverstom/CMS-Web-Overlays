const InfoCards = {
    data() {
        return {
            commentators: ["TomD53", "asdkjmnafgjikanqsf"],
            show_commentators: false,

            notification: {
                title: "Notification Card",
                description: "This card could be used to show a notification, give an update about a game, or make an announcement"
            },
            show_notification: false,


            next_map_card: {
                title: "Next Map",
                map_id: 1196,
                description: "Map Two will be Lowrise"
            },
            show_next_map_card: false,
        }
    },
    methods: {
        cardEnter(el, done) {
            el.classList.remove("hidden");
            anime({
                targets: el,
                translateX: [30, 0],
                opacity: [0, 1],
                rotateZ: [5, 0],
                easing: 'easeOutBack',
                duration: 500,
                complete: done
            })
        },
        cardLeave(el, done) {
            anime({
                targets: el,
                translateX: [0, 30],
                opacity: [1, 0],
                rotateZ: [0, 5],
                easing: 'easeOutBack',
                duration: 500,
                complete: function () {
                    el.classList.add("hidden");
                    done();
                }
            })
        },
        testAnimation() {
            var context = this;
            context.show_commentators = true;
            setTimeout(function () {
                context.show_commentators = false;
            }, 5000);
        },
        handleWebSocketMessage(data) {
            var context = this;
            if (data.action_type == "connected") {
                this.createNotification("Connected", "Successfully connected to server. Ready to go!", 5000);
            } else if (data.action_type == "show_card") {
                if (data.card == "commentators") {
                    var duration = 10000;
                    if (data.duration) {
                        duration = data.duration;
                    }
                    context.show_commentators = true;
                    context.commentators = data.commentators;
                    setTimeout(function () {
                        context.show_commentators = false;
                    }, duration);
                } else if (data.card == "notification") {
                    var duration = 10000;
                    if (data.duration) {
                        duration = data.duration;
                    }
                    context.notification.title = data.title;
                    context.notification.description = data.description;
                    context.show_notification = true;
                    setTimeout(function () {
                        context.show_notification = false;
                    }, duration);
                } else if (data.card == "next_map") {
                    var duration = 10000;
                    if (data.duration) {
                        duration = data.duration;
                    }
                    context.next_map_card.title = data.title;
                    context.next_map_card.map_id = data.map_id;
                    context.next_map_card.description = data.description;
                    context.show_next_map_card = true;
                    setTimeout(function () {
                        context.show_next_map_card = false;
                    }, duration);
                }
            }
        },
        connectWebSocket(context, endpoint) {
            context.connection = new WebSocket('ws://' + document.domain + ':' + location.port + endpoint);
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
                }, 1000);
            };
            context.connection.onerror = function (error) {
                console.error('Socket encountered error: ', error.message, 'Closing socket');
                context.connection.close();
            };
        },
        createNotification(title, description, duration) {
            this.notification.title = title;
            this.notification.description = description;
            this.show_notification = true;
            var context = this;
            setTimeout(function () {
                context.show_notification = false;
            }, duration);
        }
    },
    delimiters: ['[[', ']]'],
    created: function () {
        // Open the websocket that listens for popups
        this.connectWebSocket(this, "/ws/cards")
    }
}

Vue.createApp(InfoCards).mount('#info_cards')