/**
 * Returns a response object with status 400.
 * @param {string} body - The body of the response.
 * @returns {Object} - The response.
 */
function badRequest(body){
    const response = {
        statusCode: 400,
        body
    };
    console.log(response); 
    return response;
}

/**
 * Tests whether the given email has valid syntax or not.
 * @param {string} email - The email to test.
 * @returns {boolean} - true if the email is valid, false otherwise.
 */
function emailIsValid (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * An endpoint that receives through a POST request a JSON with objects that
 * have the name and email of each person that participates in a secret santa
 * group, makes the matching between people, and sends to each one the name of
 * the person for whom they are secret santa.
 */
exports.handler = async (event, context) => {
    if(event.httpMethod != 'POST')
        return {
            statusCode: 405,
            body: 'Error: only POST is allowed'
        };
    let people;
    try{
        people = JSON.parse(event.body);
    }catch(error){
        return badRequest('Error: body is not valid JSON');
    }
    if(!Array.isArray(people))
        return badRequest('Error: the provided data is not a JSON array');
    if(people.length < 3)
        return badRequest('Error: the provided array cannot have a length less than 3')
    for(const {name, email} of people){
        if(typeof name != 'string')
            return badRequest('Error: one of the objects does not have a name property string');
        if(typeof email != 'string' || !emailIsValid(email))
            return badRequest(`Error: ${email} is not a valid email`);
    }
    
    // Shuffle the array of people
    const shuffled = [...people]
    for(let i=0; i<shuffled.length; i++){
        const j = i + Math.floor(Math.random() * (shuffled.length - i));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const lastIndex = people.length - 1
    if(shuffled[0] == people[lastIndex]){
        // This will prevent getting the same person at the end as we iterate
        // over people and pop from shuffled in the lines below
        [shuffled[0], shuffled[lastIndex]] = [shuffled[lastIndex], shuffled[0]];
    }
    const emails = [];
    // For each santa pop a person from the shuffled array and prepare an email
    for(const santa of people){
        const last = shuffled.length - 1;
        // Make sure santa is not the one we are going to pop
        if(shuffled[last] == santa){
            [shuffled[0], shuffled[last]] = [shuffled[last], shuffled[0]];
        }
        const person = shuffled.pop();
        emails.push({
            from: 'yoursecretjuan@gmail.com',
            to: santa.email,
            subject: `Hi ${santa.name}, your secret friend is...`,
            text: `Your secret friend is ${person.name}.`
        });
    }
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_KEY);
    let emailsOk = true;
    let msg = 'Emails sent.';
    try{
        await sgMail.sendMultiple(emails);
    }catch(error){
        console.log(error);
        emailsOk = false;
        if(error.reponse?.statusCode == 429)
            msg = 'Could not send the emails: the server cannot send more emails for today, please try again later.';
        else
            msg = 'Could not send the emails: an error has ocurred while sending the emails.';
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            emailsOk,
            msg
        })
    };
};
