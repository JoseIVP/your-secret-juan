const form = document.forms["participants-form"];
const addParticipantBtn = form.elements["add-participant-btn"];
const participantTemplate = document.querySelector("#participant-template");
const participantsList = form.elements["participants-list"];
const submitBtn = form.querySelector("button[type=submit]");


addParticipantBtn.onclick = () => {
    // Get the name and email to add new participant
    const nameInput = form.elements["participant-name"];
    const emailInput = form.elements["participant-email"];
    const participantName = nameInput.value;
    const participantEmail = emailInput.value;
    emailInput.value = "";
    nameInput.value = "";
    nameInput.focus(); // Allows to add participants quickly
    // Get the template to add a new participant and fill the inputs
    const participantFragment = participantTemplate.content.cloneNode(true);
    const fragmentNameInput = participantFragment.querySelector(".participant-name");
    fragmentNameInput.value = participantName;
    // Add a custom validity message for the name input
    fragmentNameInput.oninvalid = function() {
        this.setCustomValidity(this.dataset.customValidity);
        this.addEventListener("input", () => this.setCustomValidity(""), {once: true});
    };
    participantFragment.querySelector(".participant-email").value = participantEmail;
    participantFragment.querySelector(".remove-participant-btn").onclick = function () {
        participantsList.removeChild(this.parentNode);
        if(participantsList.children.length <= 2){
            submitBtn.disabled = true;
        }
    };
    participantsList.appendChild(participantFragment);
    if(participantsList.children.length > 2){
        submitBtn.disabled = false;
    }
};


form.onsubmit = (event) => {
    event.preventDefault();
    // console.log("form.onsubmit()");
    // Only validate the inputs from the list of participants
    for(const input of participantsList.querySelectorAll("input")){
        if(!input.validity.valid){
            input.reportValidity();
            return;
        }
    }

    // Get the data from the inputs
    const participants = [];
    for(const fieldset of participantsList.children){
        const nameInput = fieldset.querySelector(".participant-name");
        const emailInput = fieldset.querySelector(".participant-email");
        const participant = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim()
        }
        participants.push(participant);
    }
    // TODO: Open a dialog for confirmation
    // Send the data
    const options = {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(participants),
    };
    fetch("/.netlify/functions/shuffle", options)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        return Promise.reject(response.text());
    })
    .then(result => {
        if(result.emailsOk){
            // TODO: Show a success message
            console.log(result.msg);
            return;
        }
        return Promise.reject(result.msg)
    })
    .catch(errorMsg => console.log(errorMsg));
    // TODO: remove the participants list
};
