const { User } = require('../models')
const { signToken } = require('../utils/auth');

const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userInfo = await User.findOne({
                    _id: context.user_id
                }).select("-__v -password");
                return userInfo;
            }
            throw new AuthenticationError("Not logged in!")
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user);
            return { user, token };
        },
        login: async (parent, args) => {
            const user = await User.findOne(args.email);
            if (!user) throw new AuthenticationError("Can't find the user!");
            const correctPw = await user.isCorrectPassword(args.password);
            if (!correctPw) throw new AuthenticationError("Can't find the user!");
            const token = signToken(user);
            return { user, token };
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate({ _id: context.user._id }, { $addToSet: { savedBooks: args.bookData } }, { new: true });
                return updatedUser;
            }
            throw newAuthenticationError('login required')
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate({ _id: context.user._id }, {$pull:{savedBoooks: args.bookId}}, {new:true});
                return updatedUser;
            }
            throw newAuthenticationError('login required')
            }
        }
    }

    module.exports = resolvers;
