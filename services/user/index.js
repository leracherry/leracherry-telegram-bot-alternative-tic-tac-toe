const User = require("../../models/User");

class Index {
    async checkNewUser(id) {
        const candidate = await User.findOne({ id });
        if (!candidate) {
            const firstName = 'ctx.message.from.first_name';

            const user = new User({
                id,
                name: firstName,
                role: 'user',
                gameType: 'bot',
                createdAt: new Date()
            });

            await user.save();
        }

        console.log('created')
    }

    async updateGameType(id, gameType){
        const user = await User.findOne({ id });
        if(!user) {
            throw new Error('User not found')
        }
        user.gameType = gameType
        await user.save()
    }

    async isBotGameType(id){
        const user = await User.findOne({ id });
        if(!user) {
            throw new Error('User not found')
        }

        return user.gameType === 'bot'
    }

}

module.exports = new Index()