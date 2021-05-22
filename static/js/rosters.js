const Rosters = {
    data(){
        return {
            usernames: [
                ["TomD53", "pestoo", "eeyore6", "gamren", "Islendingur", "Cherriie"],
                ["Carowinds", "avrged", "Arzuloria", "CertifiedPlexer", "FireTurtle", "mimisberry"]
            ],
            team_name: "Fotia",
            team_logo: "/static/assets/team_logos/fotia.png"
        }
    },
    delimiters: ['[[', ']]']
}

Vue.createApp(Rosters).mount("#rosters");