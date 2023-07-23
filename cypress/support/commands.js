// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('resetUser', () => {
    cy.request('DELETE', '/auth/reset');    
})

Cypress.Commands.add('badRequest',  (response, message = []) => {
    expect(response.status).to.eq(400)
    expect(response.body.error).to.eq('Bad Request')
    message.forEach((message) => {
        expect(message).to.be.oneOf(response.body.message)
    })
})

Cypress.Commands.add('unauthorized', (response) => {
    expect(response.status).to.eq(401)
    expect(response.body.message).to.eq('Unauthorized')
})

Cypress.Commands.add('checkUnauthorized', (method, url) => {
    cy.request({
        method: method,
        url: url,
        headers: { 
            'Accept-Language': 'en-us',
            authorization: null
        },
        failOnStatusCode: false
    }).then((response) => {
        cy.unauthorized(response)
    });
})

Cypress.Commands.add('login', () => {
    const userData = {
        name: "John Doe",
        email: "john@nest.test",
        password: "Secret@123"
    }

    cy.resetUser()

        cy.request({
            method: 'POST',
            url: '/auth/register',
            headers: { 'Content-Type': 'application/json', },
            body: userData,
        })

    cy.request({
        method: 'POST',
        url: '/auth/login',
        headers: { 'Accept-Language': 'en-us', },
        body: {
            "email": userData.email,
            "password": userData.password
        },
        failOnStatusCode: false
    }).then((response) => {
        Cypress.env('token', response.body.data.access_token)
    });
})

Cypress.Commands.add('generatePostData', (count) => {
    const { faker } = require('@faker-js/faker')

    cy.writeFile(
        'cypress/fixtures/posts.json', 
        Cypress._.times(count, () => {
        return {
                title: faker.lorem.words(3),
                content: faker.lorem.paragraph()
            }
        }) 
    )
})
