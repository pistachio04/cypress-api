describe('Post modul', () => { 
    const dataCount = 15
    before('login', () => {
        cy.login()
    })

    before('generate post data', () => cy.generatePostData(dataCount))


    describe('Create Post', () => {
    // 1. return unauthorized error
    // 2. check validation message form post
    // 2. successfulll create post 
        it('Return unauthorized error', () => {
            cy.checkUnauthorized('POST', '/posts')
        });

        it('Check validation message form post', () => {
            cy.request({
                method: 'POST',
                url: '/posts',
                headers: { 
                    'Accept-Language': 'en-us',
                    authorization: `Bearer ${Cypress.env('token')}`
                },
                failOnStatusCode: false
            }).then((response) => {
                
                cy.badRequest(response, [
                    'title must be a string',
                    'content must be a string'
                ])
            });
        });

        it('Create Post: Successfully', () => {
            cy.fixture('posts').then((postData) => {
                cy.request({
                    method: 'POST',
                    url: '/posts',
                    headers: { 
                        'Accept-Language': 'en-us',
                        authorization: `Bearer ${Cypress.env('token')}`
                    },
                    body: {
                        title: postData[0].title,
                        content: postData[0].content
                    }
                }).then((response) => {
                    cy.log({response})
                    const {success, data : {title, content, comments}} = response.body
                    expect(response.status).to.eq(201)
                    expect(success).to.be.true
                    expect(title).to.eq(postData[0].title)
                    expect(content).to.eq(postData[0].content)
                    expect(comments.length).to.eq(0)
                    expect(response.body.message).to.eq('Post created successfully')
                });  
            })
        });

    })

})