<style>
    .striked {
        text-decoration: line-through
    }
</style>
<template>
    <div>
        <div class="flex">
            <div class="w-2/3">
                <video controls style="width: 100%;" class="video-js" controls preload="auto" width="800" height="450">
                    <source v-if="selectedVideo" type="video/mp4">
                </video>
                <h3 class="p-2 text-center" v-if="current_file.episode">
                    {{ current_file.showname }} {{ current_file.episode }} &mdash; {{ current_file.friendly_name }}
                </h3>
            </div>
            <div class="w-1/3">
                <div id="element" style="overflow:scroll; border: solid thin grey;">
                    <div :id="'id_' + file.id" class="font-sans flex items-center justify-center bg-blue-darker w-full py-2"  v-for="(file, $i) in files" :class="{'striked': file.watched, }">
                        <div class="overflow-hidden bg-white rounded max-w-xs w-full shadow-lg  leading-normal">
                            <a  v-if="file" :href="'id_' + file.id" @click.prevent="selectVideo(file, $i)" :class="{'text-blue-dark': !file.watched, 'text-red bg-grey-light': file.watched, 'bg-blue-light': current_file.name === file.name}" class="block group hover:bg-blue-lighter p-4 border-b">
                                <p class="font-bold text-lg mb-1 text-black hover:text-black" :class="{'text-white': current_file.name === file.name, 'text-grey': file.watched}">{{ file.friendly_name }}</p>
                                <p class="text-grey-darker mb-2 group-hover:text-white" :class="{'text-white': current_file.name === file.name, 'text-grey': file.watched}">{{ file.showname }} &mdash; {{ file.episode }} </p>
                            </a>
                        </div>
                    </div>
                </div>
             </div> 
         </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                files: files,
                selectedVideo: 0,
                videojs_: '',
                current_file: {}
            }   
        },
        watch: {
            selectedVideo(newVal, oldVal) {
                this.current_file = this.files[this.selectedVideo]
                this.updateTheVideo(this.current_file);
                
                document.getElementById('id_' + this.current_file.id).scrollIntoView();
            }
        },
        methods: {
            selectVideo(file, i) {
                this.selectedVideo = i;
                
                this.current_file = file;
                
                this.ready = false;
                
                this.updateTheVideo(file);
            },
            
            updateTheVideo(file) {
                this.videojs_.src([
                    {type: "video/mp4", src: '/v/' + file.encrypt}
                ]);
            }
        },
        mounted() {
            this.videojs_ = videojs(document.querySelector('.video-js'), { controls: true, autoplay: true, preload: 'auto' });
            
            this.selectedVideo = this.files.filter((file) => (!file.watched))[0].id_;
            
            let thing = this;
            
            this.videojs_.ready(function(){
                this.play()
            
                this.on('ended', function() {
                    thing.selectedVideo ++;
                    thing.current_file.watched = true;
                    axios.post('/update/' + thing.current_file.id);
                });
            });
            
            $('#element').height($(window).height())

            $(window).resize(() => {
                $('#element').height($(window).height() - 20)
            });
        }
    }
</script>