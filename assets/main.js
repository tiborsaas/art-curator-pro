
const App = {
    init() {
        console.log("initializing...");
        this.endpoint = 'http://0af1cd4d.ngrok.io/predict';
        this.canvas = document.querySelector('canvas');
        this.video = document.querySelector('video');
        this.ctx = this.canvas.getContext('2d');
        this.addImageUploadEvent();
        this.addCameraEvent();
        this.addScreenshotEvent();
    },

    addImageUploadEvent() {
        const button = document.querySelector('#upload');
        button.addEventListener('change', this.fileSelectEvent.bind(this));
    },

    addCameraEvent() {
        const button = document.querySelector('#camera');
        button.addEventListener('click', this.cameraInit.bind(this));
    },

    addScreenshotEvent() {
        const button = document.querySelector('#screenshot');
        button.addEventListener('click', e => {
            console.log('sending screenshot to server...');
            this.sendImageData(this.takeScreenshot())
                .then(response => {
                    console.log(response);
                })
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