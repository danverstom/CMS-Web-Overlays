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
            text_items: ["CTF Match Spotlight", "Season Two"],
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
        }, 15000)
    },
    delimiters: ['[[', ']]'],
    created: function () {
        this.getScoreBarData();
        setInterval(this.getScoreBarData, 15000);
        this.connection = new WebSocket('ws://' + document.domain + ':' + location.port + '/ws/scorebar');
        var context = this;
        this.connection.onmessage = function (event) {
            console.log(event);
            var data = JSON.parse(event.data);
            console.log(data);
            if (data.action_type == "update_score_bar_data") {
                context.updateScoreBarData(data.score_bar_data);
            }
        }
    },
    methods: {
        async getScoreBarData() {
            // Function to GET score bar data from /get_score_bar_data
            console.log("getting score bar data");
            var response = await fetch("/get_score_bar_data");
            var data = await response.json();
            this.updateScoreBarData(data);
        },
        updateScoreBarData(data){
            if (!arrayEquals(last_text_items, data.text_items)){
                this.text_items = data.text_items;
            }
            last_text_items = data.text_items;
            this.red_name = data.red_name;
            this.red_score = data.red_score;
            this.red_logo = data.red_logo;
            this.blue_name = data.blue_name;
            this.blue_score = data.blue_score;
            this.blue_logo = data.blue_logo;
        }
    }
}

Vue.createApp(ScoreBar).mount("#score_bar")