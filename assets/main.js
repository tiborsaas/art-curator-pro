
const App = {
    init() {
        console.log("initializing...");
        this.server = 'http://60f97e7e.ngrok.io';
        this.webcam = document.querySelector('.webcam');
        this.canvas = document.querySelector('canvas');
        this.video = document.querySelector('video');
        this.ctx = this.canvas.getContext('2d');
        this.imageDataURL = '';
        this.userChoice = '';
        this.addImageUploadEvent();
        this.addCameraEvent();
        this.addScreenshotEvents();
        this.addUserPredictEvents();
    },

    addImageUploadEvent() {
        const button = document.querySelector('#upload');
        button.addEventListener('change', this.fileSelectEvent.bind(this));
    },

    addCameraEvent() {
        const button = document.querySelector('#camera');
        button.addEventListener('click', this.cameraInit.bind(this));
    },

    addUserPredictEvents() {
        const button_wrapper = document.querySelector('.predict nav');
        button_wrapper.addEventListener('click', e => {
            const user_choice = e.target.dataset.choice;

            if (user_choice) {
                this.handleUserSubmit(user_choice)
                    .then(this.displayResults.bind(this));
                this.userChoice = user_choice;
            }
        });
    },

    addScreenshotEvents() {
        const submit_button = document.querySelector('#screenshot');
        const close_button = document.querySelector('.webcam .close');

        submit_button.addEventListener('click', e => {
            this.displayUserChoiceDialog();
            this.imageDataURL = this.takeScreenshot();
        });

        close_button.addEventListener('click', e => {
            this.webcam.classList.add('hidden');
        });
    },

    fileSelectEvent(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        if (!file.type) {
            return;
        }

        if (!file.type.match('image.*')) {
            alert('No image file');
            return;
        }

        reader.onload = fileEvent => {
            this.imageDataURL = fileEvent.target.result;
            this.displayUserChoiceDialog();
        };
        reader.readAsDataURL(file);
    },

    displayUserChoiceDialog() {
        document.querySelector('.predict').classList.remove('hidden');
    },

    setUserChoiceDialogLoading() {
        document.querySelector('.predict').classList.add('loading');
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
        this.ctx.drawImage(this.video, 0, 0);
        return this.canvas.toDataURL();
    },

    displayResults(results) {
        const results_container = document.querySelector('.results')
        const first_slide = document.querySelector('.results h1:first-child');
        const second_slide = document.querySelector('.results h1:last-child span');
        
        results_container.classList.remove('hidden');
        results_container.classList.add('first');

        const prediction = (results.abstract > results.child) ? 'abstract' : 'child';
        const percent = results[prediction] * 100;
        const userCorrect = (this.userChoice == prediction) ? 'right' : 'wrong, sorry';

        first_slide.innerHTML = `I'm ${percent}% sure<br> you are ${userCorrect}`;

        const verdict = (prediction == 'abstract') ? 'abstract art' : 'child\'s drawing';
        second_slide.textContent = `It's ${verdict}`;

        setTimeout( () => {
            results_container.classList.remove('first');
            results_container.classList.add('second');
        }, 6000);
    },

    handleUserSubmit(user_choice) {
        const data = {
            image: this.imageDataURL,
            user_choice
        }
        this.setUserChoiceDialogLoading();
        return this.sendImageData(data);
    },

    sendImageData(data) {
        console.log('sending data to server...', data);
        return fetch(this.server + '/predict', {
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