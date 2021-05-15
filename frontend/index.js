const form = document.forms["participants-form"];
const addParticipantBtn = form.elements["add-participant-btn"];
const participantTemplate = document.querySelector("#participant-template");
const participantsList = form.elements["participants-list"];


addParticipantBtn.onclick = () => {
    const nameInput = form.elements["participant-name"];
    const emailInput = form.elements["participant-email"];
    const participantName = nameInput.value;
    const participantEmail = emailInput.value;
    emailInput.value = "";
    nameInput.value = "";
    nameInput.focus();
    const participantFragment = participantTemplate.content.cloneNode(true);
    participantFragment.querySelector(".participant-name").value = participantName;
    participantFragment.querySelector(".participant-email").value = participantEmail;
    participantFragment.querySelector(".remove-participant-btn").onclick = function () {
        participantsList.removeChild(this.parentNode);
    };
    participantsList.appendChild(participantFragment);
};


form.onsubmit = (event) => {
    event.preventDefault();
    console.log("form.onsubmit()");
};
