import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
chai.should()

import * as moviesData from '../data/common/imdb-movies-data.mjs'
import * as userData from '../data/mem/cmdb-data-mem.mjs'
import servicesInit from '../services/cmdb-services.mjs'
import errors from "../errors.mjs";

describe('Assignment 2: Services module tests', function () {
    const services = servicesInit(moviesData, userData)
    const greaterLimit = 300
    const negativeLimit = -1
    const stringLimit = "test"
    describe('getMoviesTop tests', function () {
        it('limit as more than 250 should throw INVALID_PARAMETER',async function () {
            // Assert
            let data = await services.getMoviesTop(greaterLimit).should.be.rejectedWith(errors.INVALID_PARAMETER())
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("limit").message)
        });
        it('limit as Negative should throw INVALID_PARAMETER',async function () {
            // Assert
            let data = await services.getMoviesTop(negativeLimit).should.be.rejectedWith(errors.INVALID_PARAMETER())
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("limit").message)
        });
        it('limit as String should throw INVALID_PARAMETER',async function () {
            // Assert
            let data = await services.getMoviesTop(stringLimit).should.be.rejectedWith(errors.INVALID_PARAMETER())
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("limit").message)
        });
        it('should return a list of top movies equal to data',async function () {
            // Act
            let data = await services.getMoviesTop(1)
            let assertionData = await moviesData.getMoviesTop(1)

            // Assert
            data[0].id.should.be.equal(assertionData[0].id)
        });
    })
    describe('getMovies tests', function () {
        const stringTitle = "test"
        it('limit as more than 250 should throw INVALID_PARAMETER',async function () {
            // Assert
            let data = await services.getMovies(stringTitle, greaterLimit).should.be.rejectedWith(errors.INVALID_PARAMETER())
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("limit").message)
        });
        it('limit as Negative should throw INVALID_PARAMETER',async function () {
            // Assert
            let data = await services.getMovies(stringTitle, negativeLimit).should.be.rejectedWith(errors.INVALID_PARAMETER())
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("limit").message)
        });
        it('limit as String should throw INVALID_PARAMETER',async function () {
            // Assert
            let data = await services.getMovies(stringTitle, stringLimit).should.be.rejectedWith(errors.INVALID_PARAMETER())
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("limit").message)
        });
        it('title as Number should throw INVALID_PARAMETER',async function () {
            // Assert
            let data = await services.getMovies(3).should.be.rejectedWith(errors.INVALID_PARAMETER())
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("title").message)
        });
        it('undefined title should throw INVALID_PARAMETER',async function () {
            // Assert
            let data = await services.getMovies().should.be.rejectedWith(errors.INVALID_PARAMETER())
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("title").message)
        });
        it('should return a list of searched title movies equal to data',async function () {
            // Act
            let data = await services.getMovies("lords",1)
            let assertionData = await moviesData.getMovies("lords",1)
            //
            // Assert
            data[0].id.should.be.equal(assertionData[0].id)
        });
    })
    describe('getGroup tests', function () {
        it('with invalid user token should throw USER_NOT_FOUND',async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.getGroup("ewfrew", 1).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.USER_NOT_FOUND().code)
            data.message.should.be.equal(errors.USER_NOT_FOUND().message)
            await userData.removeUser(user.token)
        });
        it('with invalid groupId should throw INVALID_PARAMETER',async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.getGroup(user.token, "45g").should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("groupId").message)
            await userData.removeUser(user.token)
        });
        it('with absent groupId should throw GROUP_NOT_FOUND', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.getGroup(
                user.token,
                23
            ).should.be.rejectedWith(errors.GROUP_NOT_FOUND())

            // Assert
            data.code.should.be.equal(errors.GROUP_NOT_FOUND().code)
            data.message.should.be.equal(errors.GROUP_NOT_FOUND(23).message)
            await userData.removeUser(user.token)
        })
        it('should return the group with id equal to groupId',async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )
            // Act
            let data = await services.getGroup(user.token, group.id)

            // Assert
            data.id.should.be.equal(group.id)
            data.name.should.be.equal("Test")
            data.description.should.be.equal("Test")
            await userData.removeUser(user.token)
        });
    })
    describe('createGroup tests', function () {
        it('with invalid name should throw INVALID_PARAMETER', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.createGroup(
                user.token,
                {
                    description: "Test"
                }
            ).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("name").message)
            await userData.removeUser(user.token)
        })
        it('should create a new group',async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )

            // Assert
            data.id.should.be.equal(1)
            data.name.should.be.equal("Test")
            data.description.should.be.equal("Test")
            await userData.removeUser(user.token)
        });
    })
    describe('updateGroup tests', function () {
        it('with invalid name should throw INVALID_PARAMETER', async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )

            // Act
            let data = await services.updateGroup(
                user.token,
                group.id,
                {
                    description: "Test"
                }
            ).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("name").message)
            await userData.removeUser(user.token)
        })
        it('with invalid groupId should throw INVALID_PARAMETER', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.updateGroup(
                user.token,
                {
                    description: "Test"
                }
            ).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("groupId").message)
            await userData.removeUser(user.token)
        })
        it('with absent groupId should throw GROUP_NOT_FOUND', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.updateGroup(
                user.token,
                23,
                {
                    name: "Test",
                    description: "Test"
                }
            ).should.be.rejectedWith(errors.GROUP_NOT_FOUND())

            // Assert
            data.code.should.be.equal(errors.GROUP_NOT_FOUND().code)
            data.message.should.be.equal(errors.GROUP_NOT_FOUND(23).message)
            await userData.removeUser(user.token)
        })
        it('should update group',async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )
            let newGroupRep = {
                name: "Test1",
                description: "Test1"
            }

            // Act
            let data = await services.updateGroup(
                user.token,
                group.id,
                newGroupRep
            )

            // Assert
            data.id.should.be.equal(group.id)
            data.name.should.be.equal(newGroupRep.name)
            data.description.should.be.equal(newGroupRep.description)
            await userData.removeUser(user.token)
        });
    })
    describe('deleteGroup tests', function () {
        it('with invalid groupId should throw INVALID_PARAMETER', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.updateGroup(
                user.token
            ).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("groupId").message)
            await userData.removeUser(user.token)
        })
        it('with absent groupId should throw GROUP_NOT_FOUND', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.deleteGroup(
                user.token,
                23,
                {
                    name: "Test",
                    description: "Test"
                }
            ).should.be.rejectedWith(errors.GROUP_NOT_FOUND())

            // Assert
            data.code.should.be.equal(errors.GROUP_NOT_FOUND().code)
            data.message.should.be.equal(errors.GROUP_NOT_FOUND(23).message)
            await userData.removeUser(user.token)
        })
        it('should delete group',async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )

            // Act
            await services.deleteGroup(
                user.token,
                group.id
            )

            // Assert
            user.groups.length.should.be.equal(0)
            await userData.removeUser(user.token)
        });
    })
    describe('getGroups tests', function () {
        it('with invalid user token should throw USER_NOT_FOUND',async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.getGroups("ewfrew").should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.USER_NOT_FOUND().code)
            data.message.should.be.equal(errors.USER_NOT_FOUND().message)
            await userData.removeUser(user.token)
        });
        it('should return the groups for the user id',async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )
            // Act
            let data = await services.getGroups(user.token)

            // Assert
            data[0].id.should.be.equal(group.id)
            data[0].name.should.be.equal("Test")
            data[0].description.should.be.equal("Test")
            await userData.removeUser(user.token)
        });

    })
    describe('addMovie tests', function () {
        it('with invalid groupId should throw INVALID_PARAMETER', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.addMovie(
                user.token,
                "",
                ""
            ).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("groupId").message)
            await userData.removeUser(user.token)
        })
        it('with invalid movieId should throw INVALID_PARAMETER', async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )
            let movieId = ""

            // Act
            let data = await services.addMovie(
                user.token,
                group.id
            ).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("movieId").message)
            await userData.removeUser(user.token)
        })
        it('with absent groupId should throw GROUP_NOT_FOUND', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.addMovie(
                user.token,
                23,
                "tt0111161"
            ).should.be.rejectedWith(errors.GROUP_NOT_FOUND())

            // Assert
            data.code.should.be.equal(errors.GROUP_NOT_FOUND().code)
            data.message.should.be.equal(errors.GROUP_NOT_FOUND(23).message)
            await userData.removeUser(user.token)
        })
        it('should add a movie to a group',async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )

            // Act
            let data = await services.addMovie(
                user.token,
                group.id,
                "tt0111161"
            )

            // Assert
            data.id.should.be.equal(group.id)
            data.movies[0].id.should.be.equal("tt0111161")
            await userData.removeUser(user.token)
        });
    })
    describe('removeMovie tests', function () {
        it('with invalid groupId should throw INVALID_PARAMETER', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.removeMovie(
                user.token,
                "",
                ""
            ).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("groupId").message)
            await userData.removeUser(user.token)
        })
        it('with invalid movieId should throw INVALID_PARAMETER', async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )
            let movieId = ""

            // Act
            let data = await services.removeMovie(
                user.token,
                group.id
            ).should.be.rejectedWith(errors.INVALID_PARAMETER())

            // Assert
            data.code.should.be.equal(errors.INVALID_PARAMETER().code)
            data.message.should.be.equal(errors.INVALID_PARAMETER("movieId").message)
            await userData.removeUser(user.token)
        })
        it('with absent groupId should throw GROUP_NOT_FOUND', async function () {
            // Arrange
            let user = await services.createUser()

            // Act
            let data = await services.removeMovie(
                user.token,
                23,
                "tt0111161"
            ).should.be.rejectedWith(errors.GROUP_NOT_FOUND())

            // Assert
            data.code.should.be.equal(errors.GROUP_NOT_FOUND().code)
            data.message.should.be.equal(errors.GROUP_NOT_FOUND(23).message)
            await userData.removeUser(user.token)
        })
        it('should remove a movie from a group',async function () {
            // Arrange
            let user = await services.createUser()
            let group = await services.createGroup(
                user.token,
                {
                    name: "Test",
                    description: "Test"
                }
            )
            await services.addMovie(
                user.token,
                group.id,
                "tt0111161"
            )

            // Act
            let data = await services.removeMovie(
                user.token,
                group.id,
                "tt0111161"
            )

            // Assert
            data.id.should.be.equal(group.id)
            data.movies.length.should.be.equal(0)
            await userData.removeUser(user.token)
        });
    })
    describe('createUser tests', function () {
        it('should create a new user',async function () {
            // Arrange
            // Act
            let data = await services.createUser()
            let user = await userData.getUser(data.token)
            // Assert
            data.id.should.be.equal(user.id)
            await userData.removeUser(user.token)
        });
    })
})

