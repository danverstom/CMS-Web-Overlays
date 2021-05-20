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
        }
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
        }
    },
}

var app = Vue.createApp(StartingSoon).mount("#starting_soon")