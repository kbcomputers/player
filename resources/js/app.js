require('./bootstrap');

Vue.component('video-player', require('./components/Player.vue'));

new Vue({
    el: '#app'
});
