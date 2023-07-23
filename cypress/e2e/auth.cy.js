const { describe } = require("mocha")

describe('Auth Module', () => {
    
    const userData = {
        name: "John Doe",
        email: "john@nest.test",
        password: "Secret@123"
    }

    describe('Register', () => {
    /**
     * 1. verify error validation (null name, email and password)
     * 2. verify invalid email format
     * 3. verify invalid password format
     * 4. verify registered successfully with valid data
     * 5. verify error duplicate data 
     * */    
    
    it('Verify validation for empty name, email and password', ()=> {
        cy.request({
            method: 'POST',
            url: '/auth/register',
            headers: { 'Content-Type': 'application/json'},
            failOnStatusCode: false,
        }).then((response) => {
            // expect(response.status).to.eq(400)
            // expect(response.body.error).to.eq('Bad Request')
            // expect('name should not be empty').to.be.oneOf(response.body.message)
            // expect('email should not be empty').to.be.oneOf(response.body.message)
            // expect('password should not be empty').to.be.oneOf(response.body.message)
            
            //after refactor using command badRequest
            cy.badRequest(response, [
                'name should not be empty',
                'email should not be empty',
                'password should not be empty'

            ])
        })
    })

    it('Verify Register with invalid email format', () => {
        cy.request({
            method: 'POST',
            url: '/auth/register',
            headers: { 'Content-Type': 'application/json', },
            body: {
                "name": userData.name,
                "email": "john @ nest.test",
                "password": userData.password
            },
            failOnStatusCode: false
        }).then((response) => {
            // expect(response.status).to.eq(400)
            // expect(response.body.error).to.eq('Bad Request')
            // expect('email must be an email').to.be.oneOf(response.body.message)
            
            //after refactor using command badRequest
            cy.badRequest(response, ['email must be an email'])
        })
    });

    it('Verify invalid password format', () => {
        cy.request({
            method: 'POST',
            url: '/auth/register',
            headers: { 'Content-Type': 'application/json', },
            body: {
                "name": userData.name,
                "email": userData.email,
                "password": "invalidpassword"
            },
            failOnStatusCode: false
        }).then((response) => {
            // expect(response.status).to.eq(400)
            // expect(response.body.error).to.eq('Bad Request')
            // expect('password is not strong enough').to.be.oneOf(response.body.message)

            //after refactor using command badRequest
            cy.badRequest(response, ['password is not strong enough'])
        })
    });

    it('Verify successfuly registration with valid data', () => {
        cy.resetUser()

        cy.request({
            method: 'POST',
            url: '/auth/register',
            headers: { 'Content-Type': 'application/json', },
            body: userData,
        }).then((response) => {
            const {id, name, email, password} = response.body.data
            expect(response.status).to.eq(201)
            expect(response.body.success).to.eq(true)
            expect(response.body.message).to.eq('User registered successfully')
            expect(id).not.to.be.undefined
            expect(name).to.eq('John Doe')
            expect(email).to.eq('john@nest.test')
            expect(password).to.be.undefined
        })
    });

    it('Verify error when register with existing email', () => {
        cy.request({
            method: 'POST',
            url: '/auth/register',
            headers: { 'Content-Type': 'application/json', },
            body: userData,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(500)
            expect(response.body.success).to.eq(false)
            expect(response.body.message).to.eq('Email already exists')
        })
    });

    })  
    
    describe('Login', () => { 
        // 1. unauthorized on failed
        // 2. return successfull access token on success

        it('Should return unauthorized on failed', () => {
            cy.request({
                method: 'POST',
                url: '/auth/login',
                headers: { 'Accept-Language': 'en-us', },
                failOnStatusCode: false
            }).then((response) => {
                cy.unauthorized(response)
            });
        });

        it('Login with wrong Password', () => {
            cy.request({
                method: 'POST',
                url: '/auth/login',
                headers: { 'Accept-Language': 'en-us', },
                body: {
                    "email": userData.email,
                    "password": "wrongpassword"
                },
                failOnStatusCode: false
            }).then((response) => {
                cy.unauthorized(response)
            });
        });

        it('Login with Valid Credential', () => {
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
                expect(response.body.success).to.be.true
                expect(response.body.message).to.eq('Login success')
                expect(response.body.data.access_token).not.to.be.undefined
            });
        });
     })

    describe('Me', () => { 
        //1. error unathorized     
        //2. return correct data of Me

    before('do Login', () => {
        cy.login()
    })

    it('Should return unauthorized when send no acces_token', () => {
        cy.checkUnauthorized('GET', '/auth/me')
    });

    it('Should return correct data', () => {
        cy.request({
            method: 'GET',
            url: '/auth/me',
            headers: { 
                'Accept-Language': 'en-us',
                authorization: `Bearer ${Cypress.env('token')}`
            },
            failOnStatusCode: false
        }).then((response) => {
            const {id, name, email, password} = response.body.data
            expect(response.status).to.eq(200)
            expect(response.body.success).to.eq(true)
            expect(response.body.message).to.eq('Get current user')
            expect(id).not.to.be.undefined
            expect(name).to.eq(userData.name)
            expect(email).to.eq(userData.email)
        });
    });

    })
})