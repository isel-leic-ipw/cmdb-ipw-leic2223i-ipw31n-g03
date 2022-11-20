export default {
    INVALID_PARAMETER: (argName, description) => {
        return {
            code: 1,
            message: `Invalid argument ${argName}`,
            description: description
        }
    },
    USER_NOT_FOUND: () => {
        return {
            code: 2,
            message: `User not found`
        }
    },
    GROUP_NOT_FOUND: (groupId) => {
        return {
            code: 3,
            message: `Group with id ${groupId} not found`
        }
    },
    USER_NAME_ALREADY_USED: () => {
        return {
            code: 4,
            message: `UserName Already in use`
        }
    }

}