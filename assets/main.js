
const App = {
    init() {
        console.log("initializing...");
        this.endpoint = 'http://b72c2056.ngrok.io/predict';
        this.webcam = document.querySelector('.webcam');
        this.canvas = document.querySelector('canvas');
        this.video = document.querySelector('video');
        this.ctx = this.canvas.getContext('2d');
        this.addImageUploadEvent();
        this.addCameraEvent();
        this.addScreenshotEvents();
    },

    addImageUploadEvent() {
        const button = document.querySelector('#upload');
        button.addEventListener('change', this.fileSelectEvent.bind(this));
    },

    addCameraEvent() {
        const button = document.querySelector('#camera');
        button.addEventListener('click', this.cameraInit.bind(this));
    },

    addScreenshotEvents() {
        const submit_button = document.querySelector('#screenshot');
        const close_button = document.querySelector('.webcam .close');

        submit_button.addEventListener('click', e => {
            console.log('sending screenshot to server...');
            this.sendImageData(this.takeScreenshot())
                .then(response => {
                    console.log(response);
                })
        });
        
        close_button.addEventListener('click', e => {
            this.webcam.classList.add('hidden');            
        });
    },

    fileSelectEvent(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        if (!file.type.match('image.*')) {
            alert('No image file')
            return;
        }

        reader.onload = fileEvent => {
            console.log('sending file to server...');
            this.sendImageData(fileEvent.target.result)
                .then(response => {
                    console.log(response);
                })
        };
        reader.readAsDataURL(file);
    },

    cameraInit() {
        const config = {
            audio: false,
            video: true
        };
        navigator.mediaDevices.getUserMedia(config)
            .then(stream => {
                this.video.srcObject = stream;
                this.video.onloadedmetadata = e => {
                    this.video.play();
                    this.webcam.classList.remove('hidden');
                    this.setupCanvas();
                };
            })
            .catch(function (err) {
                console.log(err);
            });
    },

    setupCanvas() {
        this.canvas.width = this.video.offsetWidth;
        this.canvas.height = this.video.offsetHeight;
    },

    takeScreenshot() {
        console.log(this.ctx, this.canvas);
        
        this.ctx.drawImage(this.video, 0, 0);
        return this.canvas.toDataURL();
    },

    sendImageData(imageData) {
        const data = {
            image: imageData
        }
        return fetch(this.endpoint, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .catch(error => console.error(`SERVER ERROR`, error));
    }
}

App.init();