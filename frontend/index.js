const form = document.forms["participants-form"];
const addParticipantBtn = form.elements["add-participant-btn"];
const participantTemplate = document.querySelector("#participant-template");
const participantsList = form.elements["participants-list"];
const submitBtn = form.querySelector("button[type=submit]");
const confirmationElement = document.querySelector("#confirmation");
const cancelBtn = document.querySelector("#confirmation .cancel-btn");
const confirmBtn = document.querySelector("#confirmation .confirm-btn");
const messageElement = document.querySelector("#message");
const messageTextElement = document.querySelector("#message .text")
const closeMessageBtn = document.querySelector("#message .close-btn");


addParticipantBtn.onclick = () => {
    /* Adds a participant to the list. */

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

function switchFormControls(to){
    const disabled = to === "disabled";
    form.querySelectorAll("fieldset").forEach(f => f.disabled = disabled);
    submitBtn.disabled = disabled;
}

form.onsubmit = (event) => {
    /* Validates the data and open the confirmation element. */

    event.preventDefault();
    // Only validate the inputs from the list of participants
    for(const input of participantsList.querySelectorAll("input")){
        if(!input.validity.valid){
            input.reportValidity();
            return;
        }
    }
    // Open the confirmation element
    confirmationElement.classList.remove("hidden");

    // Disable the form's controls
    switchFormControls("disabled");
};


confirmBtn.onclick = () => {
    /* Submits the data for sending the emails. */

    // Close the confirmation element
    confirmationElement.classList.add("hidden");
    // Show the status message
    messageElement.className = "processing";
    messageTextElement.textContent = "Sending emails.";

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
        // Either the emails were sent or there was an error related to Sendgrid
        messageTextElement.textContent = result.msg;
        messageElement.className = result.emailsOk? "success": "failure";
    })
    .catch(errorMsg => {
        // There was an error between this application and the server
        messageElement.className = "failure";
        messageTextElement.textContent = "An error has ocurred between the application and the server.";
        console.log(errorMsg);
    })
    .finally(() => {
        // Enable the form's controls
        switchFormControls("enabled");
    });
};


cancelBtn.onclick = () => {
    /* Closes the confirmation element. */

    confirmationElement.classList.add("hidden");
    // Also enable the form's control's
    switchFormControls("enabled");
};


closeMessageBtn.onclick = () => {
    /* Closes the message element. */

    messageElement.classList.add("hidden");
};
